import {BaseError} from 'src/error/BaseError';

export class ContainerNotBoundError extends BaseError {
  constructor(msg = 'container is not bound', ...nested: Array<Error>) {
    super(msg, ...nested);
  }
}
