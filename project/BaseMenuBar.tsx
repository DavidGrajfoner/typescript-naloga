import { IconName } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import { useBrandingClass } from "../../../common/hooks/useBrandingClass";
import { foldTestIds } from "../../../common/i18n";
import { HalUIProps } from "../base.interface";
import { BaseIcon } from "../icons/BaseIcon";
import { BaseMenuBarProps, BaseMenuItemProps, MenuWithIcon } from "./BaseMenuBar.interface";
import "./BaseMenuBar.scss";

let componentClass = "halui-menu";

const Item: React.FC<PropsWithChildren<BaseMenuItemProps>> = ({
    children,
    onClick,
    testAtId,
    className,
    brand,
    testAtIdForMenu,
    rowTestAtId,
    el,
}: PropsWithChildren<BaseMenuItemProps>) => {
    let rootClass = useBrandingClass(componentClass, brand, className);
    return (
        <div
            className={clsx(`${rootClass}__item`)}
            onClick={onClick}
            {...foldTestIds([testAtId, rowTestAtId && rowTestAtId(el)])}
        >
            {children}
        </div>
    );
};

function BaseMenuBar({
    brand,
    className,
    theme,
    color = "primary",
    menuItems,
    selected,
    size = "standard",
    rounded,
    border,
    vertical,
    onClick,
    width,
    height,
    testAtId,
    rowTestAtId,
    testIdForLeftMenu,
}: PropsWithChildren<HalUIProps & BaseMenuBarProps>) {
    let rootClass = useBrandingClass(componentClass, brand, className);
    const clickHandler = (el: MenuWithIcon) => {
        return onClick ? onClick(el.id) : null;
    };
    const containerModifiers = {
        [`${rootClass}--vertical`]: vertical,
    };
    const modifiers = {
        [`${rootClass}__item--rounded`]: rounded,
        [`${rootClass}__item--border`]: border,
    };
    return (
        <div className={clsx(rootClass, `${rootClass}--${size}`, containerModifiers)} {...testAtId}>
            {menuItems &&
                menuItems.map((el, index) => {
                    return (
                        <React.Fragment key={index}>
                            <Item
                                className={clsx(
                                    !theme && `${rootClass}__item--${color}`,
                                    `${rootClass}__item--${theme}`,
                                    `${rootClass}--${size}`,
                                    el.id === selected && `${rootClass}__item--active`,
                                    modifiers,
                                    rootClass,
                                )}
                                // testAtIdForMenu={el.testAtId}
                                testAtId={testIdForLeftMenu === true ? testAtId : el.testAtId}
                                rowTestAtId={rowTestAtId}
                                onClick={() => clickHandler(el)}
                                el={el}
                            >
                                {el.withIcon
                                    ? [
                                          <span className={`${rootClass}__item--icon`} key={index}>
                                              <BaseIcon
                                                  name={el.icon?.name as IconName}
                                                  width={width}
                                                  height={height}
                                              />
                                          </span>,
                                          <span key={el.id}>{el.title}</span>,
                                      ]
                                    : el.title}
                                <div>{el.title2}</div>
                            </Item>
                            <div className={`${rootClass}__borders`} />
                        </React.Fragment>
                    );
                })}
        </div>
    );
}

export { BaseMenuBar };
