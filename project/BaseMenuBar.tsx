import { IconName } from "@fortawesome/fontawesome-svg-core";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import { useBrandingClass } from "../../../common/hooks/useBrandingClass";
import { foldTestIds } from "../../../common/i18n";
import { HalUIProps } from "../base.interface";
import { BaseIcon } from "../icons/BaseIcon";
import { BaseMenuBarProps, BaseMenuItemProps, MenuWithIcon } from "./BaseMenuBar.interface";
import "./BaseMenuBar.scss";

// Globalna konstanta componentClass
const componentClass = "halui-menu";

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

    const rootClass = useBrandingClass(componentClass, brand, className);

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
            {menuItems && menuItems.map((el) => {
                    return (
                        <React.Fragment key={el.id}> {/* Pri zagotavljanju edinstvenosti ključa v funkciji .map() sem uporabil el.id */}
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
                                testAtId={testIdForLeftMenu ? testAtId : el.testAtId}
                                rowTestAtId={rowTestAtId}
                                onClick={() => clickHandler(el)}
                                el={el}
                            >
                                {el.withIcon ? (
                                    <>
                                        <span className={`${rootClass}__item--icon`}> {/* Odstranjen key */}
                                            <BaseIcon
                                                name={el.icon?.name as IconName}
                                                width={width}
                                                height={height}
                                            />
                                        </span>
                                        <span>{el.title}</span> {/* Odstranjen key */}
                                    </>
                                ) : ( el.title)}
                                {el.title2 && <div>{el.title2}</div>}  {/* Pogojno renderiramo title2 */}
                            </Item>
                            <div className={`${rootClass}__borders`} />
                        </React.Fragment>
                    );
                })}
        </div>
    );
}

const Item: React.FC<PropsWithChildren<BaseMenuItemProps>> = ({
    children,
    onClick,
    testAtId,
    className,
    brand,
    rowTestAtId,
    el,
}) => {

    const rootClass = useBrandingClass(componentClass, brand, className);

    return (
        <div
            className={clsx(`${rootClass}__item`, className)}
            onClick={onClick}
            {...foldTestIds([testAtId, rowTestAtId && rowTestAtId(el)])}
        >
            {children}
        </div>
    );
};

export { BaseMenuBar };
