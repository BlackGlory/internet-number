import { isIterable, isAsyncIterable } from '@blackglory/types'

/* eslint-disable */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeIterable(): R
      toBeAsyncIterable(): R
    }
  }
}
/* eslint-enable */

expect.extend({
  toBeIterable(received: unknown) {
    if (isIterable(received)) {
      return {
        message: () => `expected ${received} not to be a Iterable`
      , pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be a Iterable`
      , pass: false
      }
    }
  }
, toBeAsyncIterable(received: unknown) {
    if (isAsyncIterable(received)) {
      return {
        message: () => `expected ${received} not to be a AsyncIterable`
      , pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be a AsyncIterable`
      , pass: false
      }
    }
  }
})
