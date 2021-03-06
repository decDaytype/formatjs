/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import * as React from 'react';
import type {
  PrimitiveType,
  FormatXMLElementFn,
  Options as IntlMessageFormatOptions,
} from 'intl-messageformat';
import {Context} from './injectIntl';
import {invariantIntlContext} from '../utils';
import * as shallowEquals_ from 'shallow-equal/objects';
import {MessageDescriptor} from '@formatjs/intl';
const shallowEquals: typeof shallowEquals_ =
  (shallowEquals_ as any).default || shallowEquals_;

export interface Props<
  V extends Record<string, any> = Record<string, React.ReactNode>
> extends MessageDescriptor {
  values?: V;
  tagName?: React.ElementType<any>;
  children?(...nodes: React.ReactNodeArray): React.ReactNode;
  ignoreTag?: IntlMessageFormatOptions['ignoreTag'];
}

class FormattedMessage<
  V extends Record<string, any> = Record<
    string,
    | PrimitiveType
    | React.ReactElement
    | FormatXMLElementFn<React.ReactNode, React.ReactNode>
  >
> extends React.Component<Props<V>> {
  static displayName = 'FormattedMessage';

  shouldComponentUpdate(nextProps: Props<V>): boolean {
    const {values, ...otherProps} = this.props;
    const {values: nextValues, ...nextOtherProps} = nextProps;
    return (
      !shallowEquals(nextValues, values) ||
      !shallowEquals(otherProps, nextOtherProps)
    );
  }

  render(): JSX.Element {
    return (
      <Context.Consumer>
        {(intl): React.ReactNode => {
          invariantIntlContext(intl);

          const {formatMessage, textComponent: Text = React.Fragment} = intl;
          const {
            id,
            description,
            defaultMessage,
            values,
            children,
            tagName: Component = Text,
            ignoreTag,
          } = this.props;

          const descriptor = {id, description, defaultMessage};
          let nodes: React.ReactNode = formatMessage(descriptor, values, {
            ignoreTag,
          });

          if (!Array.isArray(nodes)) {
            nodes = [nodes];
          }

          if (typeof children === 'function') {
            return children(nodes);
          }

          if (Component) {
            // Needs to use `createElement()` instead of JSX, otherwise React will
            // warn about a missing `key` prop with rich-text message formatting.
            return React.createElement(Component, null, ...(nodes as any));
          }
          return nodes;
        }}
      </Context.Consumer>
    );
  }
}

export default FormattedMessage;
