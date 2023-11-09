import { useMutableCallback, useSafely } from '@rocket.chat/fuselage-hooks';
import * as UiKit from '@rocket.chat/ui-kit';
import { useContext, useMemo, useState } from 'react';

import { UiKitContext } from '../contexts/UiKitContext';

const hasInitialValue = <TElement extends UiKit.ActionableElement>(
  element: TElement
): element is TElement & { initialValue: number | string } =>
  'initialValue' in element;

const hasInitialTime = <TElement extends UiKit.ActionableElement>(
  element: TElement
): element is TElement & { initialTime: string } => 'initialTime' in element;

const hasInitialDate = <TElement extends UiKit.ActionableElement>(
  element: TElement
): element is TElement & { initialDate: string } => 'initialDate' in element;

const hasInitialOption = <TElement extends UiKit.ActionableElement>(
  element: TElement
): element is TElement & { initialOption: UiKit.Option } =>
  'initialOption' in element;

const hasInitialOptions = <TElement extends UiKit.ActionableElement>(
  element: TElement
): element is TElement & { initialOptions: UiKit.Option[] } =>
  'initialOptions' in element;

const getInitialValue = <TElement extends UiKit.ActionableElement>(
  element: TElement
) =>
  (hasInitialValue(element) && element.initialValue) ||
  (hasInitialTime(element) && element.initialTime) ||
  (hasInitialDate(element) && element.initialDate) ||
  (hasInitialOption(element) && element.initialOption.value) ||
  (hasInitialOptions(element) &&
    element.initialOptions.map((option) => option.value)) ||
  undefined;

const getElementValueFromState = (
  actionId: string,
  values: Record<
    string,
    | {
        value: unknown;
      }
    | undefined
  >,
  initialValue: string | number | string[] | undefined
) => {
  return (
    (values &&
      (values[actionId]?.value as string | number | string[] | undefined)) ??
    initialValue
  );
};

type UiKitState<
  TElement extends UiKit.ActionableElement = UiKit.ActionableElement
> = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error?: string;
  value: UiKit.ActionOf<TElement>;
};

export const useUiKitState = <TElement extends UiKit.ActionableElement>(
  element: TElement,
  context: UiKit.BlockContext
): [
  state: UiKitState<TElement>,
  action: (
    pseudoEvent?:
      | Event
      | { target: EventTarget }
      | { target: { value: UiKit.ActionOf<TElement> } }
  ) => void
] => {
  const { blockId, actionId, appId, dispatchActionConfig } = element;
  const {
    action,
    appId: appIdFromContext = undefined,
    viewId = undefined,
    updateState,
  } = useContext(UiKitContext);

  const initialValue = getInitialValue(element);

  const { values, errors } = useContext(UiKitContext);

  const _value = getElementValueFromState(actionId, values, initialValue);
  const error = errors?.[actionId];

  const [value, setValue] = useSafely(useState(_value));
  const [loading, setLoading] = useSafely(useState(false));

  const actionFunction = useMutableCallback(async (e) => {
    const {
      target: { value: elValue },
    } = e;
    setLoading(true);

    if (Array.isArray(value)) {
      const idx = value.findIndex((value) => value === elValue);

      if (idx > -1) {
        setValue(value.filter((_, i) => i !== idx));
      } else {
        setValue([...value, elValue]);
      }
    } else {
      setValue(elValue);
    }

    await updateState?.(
      { blockId, appId, actionId, value: elValue, viewId },
      e
    );
    await action(
      {
        blockId,
        appId: appId || appIdFromContext || 'core',
        actionId,
        value: elValue,
        viewId,
      },
      e
    );
    setLoading(false);
  });

  // Used for triggering actions on text inputs. Removing the load state
  // makes the text input field remain focused after running the action
  const noLoadStateActionFunction = useMutableCallback(async (e) => {
    const {
      target: { value },
    } = e;
    setValue(value);

    updateState &&
      (await updateState({ blockId, appId, actionId, value, viewId }, e));

    await action(
      {
        blockId,
        appId: appId || appIdFromContext || 'core',
        actionId,
        value,
        viewId,
        dispatchActionConfig,
      },
      e
    );
  });

  const stateFunction = useMutableCallback(async (e) => {
    const {
      target: { value },
    } = e;

    setValue(value);

    await updateState?.(
      {
        blockId,
        appId: appId || appIdFromContext || 'core',
        actionId,
        value,
        viewId,
      },
      e
    );
  });

  const result: UiKitState = useMemo(
    () => ({ loading, setLoading, error, value }),
    [loading, setLoading, error, value]
  );

  if (
    element.type === 'plain_text_input' &&
    Array.isArray(element?.dispatchActionConfig) &&
    element.dispatchActionConfig.includes('on_character_entered')
  ) {
    return [result, noLoadStateActionFunction];
  }

  if (
    (context &&
      [UiKit.BlockContext.SECTION, UiKit.BlockContext.ACTION].includes(
        context
      )) ||
    (Array.isArray(element?.dispatchActionConfig) &&
      element.dispatchActionConfig.includes('on_item_selected'))
  ) {
    return [result, actionFunction];
  }

  return [result, stateFunction];
};
