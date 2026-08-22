// Pure-TypeScript 2-state Gaussian HMM (diagonal covariance).
// A direct port of simple_hmm.py from the Python prototype -- same
// Baum-Welch (EM) fitting via forward-backward in log-space, plus Viterbi
// decoding for the most likely state sequence. No external ML libraries;
// this is a from-scratch implementation so there's no server-side native
// dependency to break in a serverless deployment.

type Matrix = number[][];

function logGaussianPdf(x: number[], mean: number[], variance: number[]): number {
  const d = x.length;
  let sumTerm = 0;
  let logDetTerm = 0;
  for (let i = 0; i < d; i++) {
    const v = Math.max(variance[i], 1e-8);
    const diff = x[i] - mean[i];
    sumTerm += (diff * diff) / v;
    logDetTerm += Math.log(v);
  }
  return -0.5 * (d * Math.log(2 * Math.PI) + logDetTerm + sumTerm);
}

function logSumExpArray(values: number[]): number {
  const maxVal = Math.max(...values);
  if (!isFinite(maxVal)) return maxVal;
  let sum = 0;
  for (const v of values) sum += Math.exp(v - maxVal);
  return Math.log(sum) + maxVal;
}

export interface HmmFitResult {
  means: number[][]; // [state][feature]
  covars: number[][]; // [state][feature] (diagonal variances)
  transmat: Matrix; // [from][to]
  startprob: number[];
  hiddenStates: number[]; // Viterbi-decoded state per observation
  stateProbs: number[][]; // [obs][state] smoothed posteriors (forward-backward gamma)
}

export function fitGaussianHmm(
  X: number[][],
  nComponents = 2,
  nIter = 200,
  tol = 1e-4,
  seed = 42
): HmmFitResult {
  const n = X.length;
  const d = X[0].length;
  const k = nComponents;

  // Deterministic init: sort by first feature, split into k contiguous chunks.
  // Mirrors the Python version's initialization exactly for reproducibility.
  const order = X.map((_, i) => i).sort((a, b) => X[a][0] - X[b][0]);
  const chunkSize = Math.ceil(n / k);
  const chunks: number[][] = [];
  for (let c = 0; c < k; c++) {
    chunks.push(order.slice(c * chunkSize, (c + 1) * chunkSize));
  }

  let means: number[][] = chunks.map((chunk) => {
    const m = new Array(d).fill(0);
    for (const idx of chunk) for (let f = 0; f < d; f++) m[f] += X[idx][f];
    return m.map((v) => v / chunk.length);
  });

  let covars: number[][] = chunks.map((chunk, c) => {
    const v = new Array(d).fill(0);
    for (const idx of chunk)
      for (let f = 0; f < d; f++) v[f] += (X[idx][f] - means[c][f]) ** 2;
    return v.map((val) => val / chunk.length + 1e-6);
  });

  let startprob = new Array(k).fill(1 / k);
  let transmat: Matrix = Array.from({ length: k }, () => new Array(k).fill(0.05 / (k - 1)));
  for (let i = 0; i < k; i++) transmat[i][i] = 0.95;

  let prevLL = -Infinity;

  for (let iter = 0; iter < nIter; iter++) {
    // Emission log-probabilities
    const logEmit: number[][] = X.map((x) =>
      Array.from({ length: k }, (_, j) => logGaussianPdf(x, means[j], covars[j]))
    );

    const logStart = startprob.map((p) => Math.log(Math.max(p, 1e-12)));
    const logTrans = transmat.map((row) => row.map((p) => Math.log(Math.max(p, 1e-12))));

    // Forward (log-space)
    const logAlpha: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
    for (let j = 0; j < k; j++) logAlpha[0][j] = logStart[j] + logEmit[0][j];
    for (let t = 1; t < n; t++) {
      for (let j = 0; j < k; j++) {
        const terms = new Array(k);
        for (let i = 0; i < k; i++) terms[i] = logAlpha[t - 1][i] + logTrans[i][j];
        logAlpha[t][j] = logEmit[t][j] + logSumExpArray(terms);
      }
    }

    // Backward (log-space)
    const logBeta: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
    for (let t = n - 2; t >= 0; t--) {
      for (let i = 0; i < k; i++) {
        const terms = new Array(k);
        for (let j = 0; j < k; j++) terms[j] = logTrans[i][j] + logEmit[t + 1][j] + logBeta[t + 1][j];
        logBeta[t][i] = logSumExpArray(terms);
      }
    }

    const logLL = logSumExpArray(logAlpha[n - 1]);
    const ll = logLL;

    // Posteriors (gamma)
    const gamma: number[][] = Array.from({ length: n }, (_, t) =>
      Array.from({ length: k }, (_, j) => Math.exp(logAlpha[t][j] + logBeta[t][j] - logLL))
    );

    // Pairwise posteriors (xi) summed over time, for transition update
    const xiSum: Matrix = Array.from({ length: k }, () => new Array(k).fill(0));
    for (let t = 0; t < n - 1; t++) {
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          const logXi =
            logAlpha[t][i] + logTrans[i][j] + logEmit[t + 1][j] + logBeta[t + 1][j] - logLL;
          xiSum[i][j] += Math.exp(logXi);
        }
      }
    }

    // M-step
    startprob = gamma[0].slice();
    const startSum = startprob.reduce((a, b) => a + b, 0);
    startprob = startprob.map((v) => v / (startSum || 1e-12));

    transmat = xiSum.map((row) => {
      const rowSum = row.reduce((a, b) => a + b, 0) || 1e-12;
      return row.map((v) => v / rowSum);
    });

    const gammaSum = new Array(k).fill(0);
    for (let t = 0; t < n; t++) for (let j = 0; j < k; j++) gammaSum[j] += gamma[t][j];

    const newMeans: number[][] = Array.from({ length: k }, () => new Array(d).fill(0));
    for (let t = 0; t < n; t++) {
      for (let j = 0; j < k; j++) {
        for (let f = 0; f < d; f++) newMeans[j][f] += gamma[t][j] * X[t][f];
      }
    }
    for (let j = 0; j < k; j++) {
      const denom = gammaSum[j] || 1e-12;
      for (let f = 0; f < d; f++) newMeans[j][f] /= denom;
    }

    const newCovars: number[][] = Array.from({ length: k }, () => new Array(d).fill(0));
    for (let t = 0; t < n; t++) {
      for (let j = 0; j < k; j++) {
        for (let f = 0; f < d; f++) {
          const diff = X[t][f] - newMeans[j][f];
          newCovars[j][f] += gamma[t][j] * diff * diff;
        }
      }
    }
    for (let j = 0; j < k; j++) {
      const denom = gammaSum[j] || 1e-12;
      for (let f = 0; f < d; f++) newCovars[j][f] = newCovars[j][f] / denom + 1e-6;
    }

    means = newMeans;
    covars = newCovars;

    if (Math.abs(ll - prevLL) < tol) break;
    prevLL = ll;
  }

  // Final smoothed posteriors + emission with converged parameters
  const logEmit: number[][] = X.map((x) =>
    Array.from({ length: k }, (_, j) => logGaussianPdf(x, means[j], covars[j]))
  );
  const logStart = startprob.map((p) => Math.log(Math.max(p, 1e-12)));
  const logTrans = transmat.map((row) => row.map((p) => Math.log(Math.max(p, 1e-12))));

  const logAlpha: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
  for (let j = 0; j < k; j++) logAlpha[0][j] = logStart[j] + logEmit[0][j];
  for (let t = 1; t < n; t++) {
    for (let j = 0; j < k; j++) {
      const terms = new Array(k);
      for (let i = 0; i < k; i++) terms[i] = logAlpha[t - 1][i] + logTrans[i][j];
      logAlpha[t][j] = logEmit[t][j] + logSumExpArray(terms);
    }
  }
  const logBeta: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
  for (let t = n - 2; t >= 0; t--) {
    for (let i = 0; i < k; i++) {
      const terms = new Array(k);
      for (let j = 0; j < k; j++) terms[j] = logTrans[i][j] + logEmit[t + 1][j] + logBeta[t + 1][j];
      logBeta[t][i] = logSumExpArray(terms);
    }
  }
  const finalLogLL = logSumExpArray(logAlpha[n - 1]);
  const stateProbs: number[][] = Array.from({ length: n }, (_, t) =>
    Array.from({ length: k }, (_, j) => Math.exp(logAlpha[t][j] + logBeta[t][j] - finalLogLL))
  );

  // Viterbi decoding for the most likely state sequence
  const logDelta: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
  const psi: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
  for (let j = 0; j < k; j++) logDelta[0][j] = logStart[j] + logEmit[0][j];
  for (let t = 1; t < n; t++) {
    for (let j = 0; j < k; j++) {
      let bestScore = -Infinity;
      let bestI = 0;
      for (let i = 0; i < k; i++) {
        const score = logDelta[t - 1][i] + logTrans[i][j];
        if (score > bestScore) {
          bestScore = score;
          bestI = i;
        }
      }
      psi[t][j] = bestI;
      logDelta[t][j] = bestScore + logEmit[t][j];
    }
  }
  const hiddenStates = new Array(n).fill(0);
  let bestFinal = 0;
  for (let j = 1; j < k; j++) if (logDelta[n - 1][j] > logDelta[n - 1][bestFinal]) bestFinal = j;
  hiddenStates[n - 1] = bestFinal;
  for (let t = n - 2; t >= 0; t--) hiddenStates[t] = psi[t + 1][hiddenStates[t + 1]];

  return { means, covars, transmat, startprob, hiddenStates, stateProbs };
}
