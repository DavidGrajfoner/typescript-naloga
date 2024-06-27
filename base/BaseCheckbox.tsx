import clsx from "clsx";
import { Field, FieldProps, FormikValues } from "formik";
import React, { ReactNode, useEffect, useState} from "react";
import "../../admin/common/checkbox/Adm-checkbox.scss";
import {HalUIProps, InputLabelProp,  TestAtIdProp} from "../base.interface";
import { BaseFieldError } from "../inputs/BaseInput";
import "./BaseCheckbox.scss";

// Globalna konstanta componentClass
const componentClass = "halui-checkbox-v2";


export interface BaseFormElement {
    label?: InputLabelProp;
    error?: string | ReactNode;
}

export type SizeProp = "x-small" | "small" | "standard" | "large" | "x-large";

export interface BaseCheckboxV2Props
    extends BaseFormElement,
        React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    strong?: boolean;
    customSize?: SizeProp;
    labelTestAtId?: TestAtIdProp;
}

// BaseCheckbox je eksplicitno tipiziran kot funkcionalna komponenta React
const BaseCheckbox: React.FC<BaseCheckboxV2Props & HalUIProps> = ({
    name,
    strong = false,
    disabled = false,
    onChange,
    className = "",
    label,
    customSize,
    brand,
    color = "invert-primary",
    checked,
    theme,
    labelTestAtId,
    testAtId,
    error,
    value,
    ...props
}) => {

    // Element label ima zdaj atribut htmlFor, povezan z id atributom elementa input.
    return (
        <div className={componentClass}>
            <label htmlFor={name} {...labelTestAtId}>
                <input
                    id={name}
                    type="checkbox"
                    onChange={onChange}
                    name={name}
                    className={clsx(
                      `${componentClass}__input`,
                      className,
                      `${componentClass}__input--${color}`,
                      `${componentClass}__input--${customSize}`,
                      `${componentClass}__input--margin`,
                      { checked }
                    )}
                    {...testAtId}
                    {...props}
                />
                <span className={clsx("halui-input__label", `${componentClass}__label`)}>{label}</span>
            </label>
            {/* Pogojno renderiramo BaseFieldError */}
            {error && <BaseFieldError error={error} />}
        </div>
    );
};

const WithFieldValue: React.FC<BaseCheckboxV2Props & HalUIProps> = ({
    name,
    value,
    color = "invert-primary",
    checked,
    customSize,
    className,
    onChange,
    testAtId,
    label,
    ...props
}) => {
    const [isChecked, setIsChecked] = useState<boolean>(false);

    // Pretvorba vrednosti v boolean je poenostavljena
    useEffect(() => {
        setIsChecked(value === "true" || value === true);
    }, [value]);

    return (
            <Field type="checkbox" name={name} value={value}>
                {({ field, form }: FieldProps<FormikValues>) => (
                    <div className={componentClass}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            className={clsx(
                                `${componentClass}__input`,
                                className,
                                `${componentClass}__input--${color}`,
                                `${componentClass}__input--${customSize}`,
                                { checked }
                            )}
                            {...testAtId}
                            {...props}
                            // onChange upošteva obstoječe handlerje onChange
                            onChange={(e) => {
                                form.setFieldValue(field.name, e.target.checked);
                                if (onChange) onChange(e);
                            }}
                        />
                        <span className={clsx("halui-input__label", `${componentClass}__label`)}>{label}</span>
                    </div>
                )}
            </Field>
    );
};

BaseCheckbox.Formik = WithFieldValue;

export { BaseCheckbox };
