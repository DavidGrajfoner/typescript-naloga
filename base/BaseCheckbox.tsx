import clsx from "clsx";
import { Field, FieldProps, FormikValues } from "formik";
import React, { ReactNode, useEffect, useState} from "react";
import "../../admin/common/checkbox/Adm-checkbox.scss";
import {HalUIProps, InputLabelProp,  TestAtIdProp} from "../base.interface";
import { BaseFieldError } from "../inputs/BaseInput";
import "./BaseCheckbox.scss";

let componentClass = "halui-checkbox";


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

const BaseCheckbox = ({
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
}: BaseCheckboxV2Props & HalUIProps) => {
    componentClass = `halui-checkbox-v2`;

    return (
        <div className={`${componentClass}`}>
            <label {...labelTestAtId}>
                <input
                    style={{ margin: "0 5px 0 0" }}
                    type="checkbox"
                    onChange={onChange}
                    name={name}
                    className={`halui-checkbox-v2__input ${className} halui-checkbox-v2__input--${color} 
                    halui-checkbox-v2__input--${customSize} ${checked ? "checked" : ""}`}
                    {...testAtId}
                    {...props}
                />
                <span className={clsx("halui-input__label halui-checkbox-v2__label")}>{label}</span>
            </label>
            <BaseFieldError error={error} />
        </div>
    );
};

const WithFieldValue: React.FC<BaseCheckboxV2Props & HalUIProps> = ({
    name,
    value,
    color = "invert-primary",
    ...props
}) => {
    const [isChecked, setIsChecked] = useState<boolean | undefined>(false);

    useEffect(() => {
        if (typeof value === "string") {
            return value === "true" ? setIsChecked(true) : setIsChecked(false);
        }
        if (typeof value === "boolean") {
            setIsChecked(value);
        }
    }, [value]);
    return (
        <>
            <Field type="checkbox" name={name} value={value}>
                {({ field, form }: FieldProps<FormikValues>) => (
                    <div className={`${componentClass}`}>
                        <input
                            type="checkbox"
                            checked={isChecked ?? false}
                            className={`halui-checkbox-v2__input ${props.className} halui-checkbox-v2__input--${color} 
                    halui-checkbox-v2__input--${props.customSize} ${isChecked ? "checked" : ""}`}
                            {...props.testAtId}
                            {...props}
                            onChange={(e) => {
                                form.setFieldValue(field.name, e.target.checked);
                            }}
                        />
                        <span className={clsx("halui-input__label halui-checkbox-v2__label")}>{props.label}</span>
                    </div>
                )}
            </Field>
        </>
    );
};

BaseCheckbox.Formik = WithFieldValue;

export { BaseCheckbox };
