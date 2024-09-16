function partial_pivot(A, n) {
    for (let i = 0; i < n; i++) {
        let pivot_row = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(A[j][i]) > Math.abs(A[pivot_row][i])) {
                pivot_row = j;
            }
        }
        if (pivot_row !== i) {
            for (let j = i; j <= n; j++) {
                [A[i][j], A[pivot_row][j]] = [A[pivot_row][j], A[i][j]];
            }
        }
        for (let j = i + 1; j < n; j++) {
            let factor = A[j][i] / A[i][i];
            for (let k = i; k <= n; k++) {
                A[j][k] -= factor * A[i][k];
            }
        }
    }
}
 
function back_substitute(A, n, x) {
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (A[i][n] - sum) / A[i][i];
    }
}

export default function gaussianElimination(A, b) {
    let n = A.length;
    let x = Array(n);

    const M = Array.from({ length: n }, () => Array(n + 1).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            M[i][j] = A[i][j];
        }
        M[i][n] = b[i];
    }

    partial_pivot(M, n);
    back_substitute(M, n, x);

    return x;
}
