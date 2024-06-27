import clsx from "clsx";
import { BaseButton, BaseMenuBar, MenuWithIcon, TestAtIdProp } from "@halcom/halui";
import React, { useCallback, useMemo } from "react";
import { atId } from "../../../../libs/common/atid";
import { JourneyStep } from "../../../../libs/openapi";
import { useLiterals } from "../../../../logic/hooks";

// Opredelimo vmesnik za lastnosti komponente za boljšo varnost tipov in berljivost
interface MenuProps {
    steps: JourneyStep[];
    onStepClick: (step: JourneyStep) => void;
    onNewStepClick: () => void;
    selected?: string;
    testAtId?: TestAtIdProp;
    testAtIdForMenu?: TestAtIdProp;
    rowTestAtId?: (row: MenuWithIcon) => TestAtIdProp;
}

function Menu({
    steps = [],
    selected,
    onStepClick,
    onNewStepClick,
    rowTestAtId,
    testAtId,
}: MenuProps) {
    const componentClass = "created-steps-title";
    const createdSteps = "djpa_jd_02_lbl_created_steps";
    const newStep = "djpa_jd_02_btn_new_step";

    const literals = useLiterals();

    const menubarOptions = useMemo(() => {
        return steps.map((step) => ({
            id: step.id,
            title: step.stepName,
        }));
    }, [steps]);

    const handleMenuItemClick = useCallback(
        (id: string) => {
            const target = steps.find((step) => step.id === id);
            if (target) {
                onStepClick(target);
            }
        },
        [onStepClick, steps],
    );
    return (
            <div className={clsx(`${componentClass}__container`)}>
                <div className={clsx(`${componentClass}`)} {...atId(createdSteps)}>
                    {literals(createdSteps)}
                </div>
                <BaseMenuBar
                    rowTestAtId={rowTestAtId}
                    testAtId={testAtId}
                    className="adm-created-left-menu"
                    onClick={handleMenuItemClick}
                    menuItems={menubarOptions}
                    selected={selected}
                    testIdForLeftMenu={true}
                />
                <div
                    style={{
                        paddingLeft: "20px",
                    }}
                >
                    <BaseButton.ButtonWithIcon
                        onClick={onNewStepClick}
                        border
                        color="standard"
                        height={16}
                        name="admPlusBlack"
                        width={16}
                        testAtId={atId(newStep)}
                    >
                        {literals(newStep)}
                    </BaseButton.ButtonWithIcon>
                </div>
            </div>
    );
}

export default Menu;
