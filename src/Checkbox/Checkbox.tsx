import React, { useContext, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useControlled, partitionHTMLProps, useClassNames } from '../utils';
import { CheckboxGroupContext } from '../CheckboxGroup';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
import { refType } from '../internals/propTypes';

export type ValueType = string | number;
export interface CheckboxProps<V = ValueType> extends WithAsProps {
  /** HTML title */
  title?: string;

  /** Inline layout */
  inline?: boolean;

  /** A checkbox can appear disabled and be unable to change states */
  disabled?: boolean;

  /** Make the control readonly */
  readOnly?: boolean;

  /** Render the control as plain text */
  plaintext?: boolean;

  /** Whether or not checkbox is checked. */
  checked?: boolean;

  /** The initial value of checked. */
  defaultChecked?: boolean;

  /** Whether or not checkbox is indeterminate. */
  indeterminate?: boolean;

  /** Attributes applied to the input element. */
  inputProps?: React.HTMLAttributes<HTMLInputElement>;

  /** Pass a ref to the input element. */
  inputRef?: React.Ref<any>;

  /** The HTML input value. */
  value?: V;

  /** A checkbox can receive focus. */
  tabIndex?: number;

  /** Whether to show checkbox */
  checkable?: boolean;

  /** Used for the name of the form */
  name?: string;

  /** Called when the user attempts to change the checked state. */
  onChange?: (
    value: V | undefined,
    checked: boolean,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;

  /** Called when the checkbox or label is clicked. */
  onClick?: (event: React.SyntheticEvent) => void;

  /** Called when the checkbox is clicked. */
  onCheckboxClick?: (event: React.SyntheticEvent) => void;

  /** Called when the user presses down a key. */
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * The Checkbox component is used for selecting multiple options from a set.
 * @see https://rsuitejs.com/components/checkbox
 */
const Checkbox: RsRefForwardingComponent<'div', CheckboxProps> = React.forwardRef(
  (props: CheckboxProps, ref) => {
    const checkboxGroupContext = useContext(CheckboxGroupContext);

    const {
      inline: inlineContext,
      name: nameContext,
      disabled: disabledContext,
      readOnly: readOnlyContext,
      plaintext: plaintextContext,
      onChange: onGroupChange
    } = checkboxGroupContext ?? {};

    const {
      as: Component = 'div',
      checked: controlledChecked,
      className,
      children,
      classPrefix = 'checkbox',
      checkable = true,
      defaultChecked = false,
      title,
      inputRef,
      inputProps,
      indeterminate,
      tabIndex = 0,
      disabled = disabledContext,
      readOnly = readOnlyContext,
      plaintext = plaintextContext,
      inline = inlineContext,
      name = nameContext,
      value,
      onClick,
      onCheckboxClick,
      onChange,
      ...rest
    } = props;

    const [selfChecked, setSelfChecked, selfControlled] = useControlled(
      controlledChecked,
      defaultChecked
    );

    // Either <Checkbox> is checked itself or by parent <CheckboxGroup>
    const checked = useMemo(() => {
      if (!checkboxGroupContext) {
        return selfChecked;
      }

      // fixme value from group should not be nullable
      return checkboxGroupContext.value?.some(checkedValue => checkedValue === value) ?? false;
    }, [checkboxGroupContext, selfChecked, value]);

    const { merge, prefix, withClassPrefix } = useClassNames(classPrefix);
    const classes = merge(className, withClassPrefix({ inline, indeterminate, disabled, checked }));
    const [htmlInputProps, restProps] = partitionHTMLProps(rest);

    // If <Checkbox> is within a <CheckboxGroup>, it's bound to be controlled
    // because its checked state is inferred from group's value, not retrieved from the DOM
    const controlled = checkboxGroupContext ? true : selfControlled;

    if (typeof controlled !== 'undefined') {
      // In uncontrolled situations, use defaultChecked instead of checked
      htmlInputProps[controlled ? 'checked' : 'defaultChecked'] = checked;
    }

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextChecked = event.target.checked;

        if (disabled || readOnly) {
          return;
        }

        setSelfChecked(nextChecked);
        onChange?.(value, nextChecked, event);
        onGroupChange?.(value, nextChecked, event);
      },
      [disabled, readOnly, setSelfChecked, onChange, value, onGroupChange]
    );

    if (plaintext) {
      return checked ? (
        <Component {...restProps} ref={ref} className={classes}>
          {children}
        </Component>
      ) : null;
    }

    const input = (
      <span className={prefix`wrapper`} onClick={onCheckboxClick} aria-disabled={disabled}>
        <input
          {...htmlInputProps}
          {...inputProps}
          name={name}
          value={value}
          type="checkbox"
          ref={inputRef}
          tabIndex={tabIndex}
          readOnly={readOnly}
          disabled={disabled}
          aria-disabled={disabled}
          aria-checked={indeterminate ? 'mixed' : checked}
          onClick={event => event.stopPropagation()}
          onChange={handleChange}
        />
        <span className={prefix`inner`} aria-hidden role="presentation" />
      </span>
    );

    return (
      <Component {...restProps} ref={ref} onClick={onClick} className={classes}>
        <div className={prefix`checker`}>
          <label title={title}>
            {checkable ? input : null}
            {children}
          </label>
        </div>
      </Component>
    );
  }
);

Checkbox.displayName = 'Checkbox';
Checkbox.propTypes = {
  as: PropTypes.elementType,
  title: PropTypes.string,
  className: PropTypes.string,
  inline: PropTypes.bool,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  inputProps: PropTypes.any,
  inputRef: refType,
  value: PropTypes.any,
  children: PropTypes.node,
  classPrefix: PropTypes.string,
  tabIndex: PropTypes.number,
  checkable: PropTypes.bool,
  onCheckboxClick: PropTypes.func
};

export default Checkbox;
