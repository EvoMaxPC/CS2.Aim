// SPDX-License-Identifier: Apache-2.0

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

export function mapResult<T, U, E>(
  result: Result<T, E>,
  mapper: (value: T) => U,
): Result<U, E> {
  return result.ok ? ok(mapper(result.value)) : result;
}

export function mapError<T, E, F>(
  result: Result<T, E>,
  mapper: (error: E) => F,
): Result<T, F> {
  return result.ok ? result : err(mapper(result.error));
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
