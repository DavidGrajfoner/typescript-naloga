import {
    AdminButtonsGroup,
    AdminTranslationModal,
    BaseButton,
    BaseCard,
    BaseCheckbox,
    BaseHtmlEditor,
    BaseInput,
    BaseSelect,
    RichOption,
    TranslateButton,
} from "@halcom/halui";
import { FormikProps } from "formik";
import React, { useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import * as Yup from "yup";
import { atId } from "../../../../libs/common/atid";
import { JourneyStep } from "../../../../libs/openapi";
import { useDefaultSubmitLiterals, useLiterals } from "../../../../logic/hooks";
import { CONSTANTS } from "../../../../logic/utils/constants";
import {
    INITIAL_TRANSITION_MODALS_VALUES,
    SelectedFieldProps,
    TranslationModalShowProps,
} from "../../translations/translation.config";
import { useTranslationsGeneric } from "../../translations/translationManager";
import { EntityImage } from "../image/EntityImage";
import { StepFormProps, StepTypes, UserActionTypes } from "./StepForm.interface";

const INITIAL_VALUES: Partial<JourneyStep> = {
    stepName: "",
    stepTitle: "",
    stepType: 0,
    userActionType: 0,
    userActionSchemaId: 0,
    userMessage: "",
    stepDescription: "",
    initialStep: false,
    terminationStep: false,
    flowbotSchemaId: "",
    autocompleteFunctionId: CONSTANTS.VALIDATION_API.NONE,
};

export const stepValidation = Yup.object({
    stepName: Yup.string().required("Step name is required"),
    stepTitle: Yup.string().required("Entry title is required"),
    stepType: Yup.number().test("len", "Step type is required", (val) => val !== -1),
    flowbotFunctionId: Yup.string().when("stepType", {
        is: (stepType: number) => stepType === 2 || stepType === 8 || stepType === 9 || stepType === 10,
        then: Yup.string().required("Field is required"),
    }),
    subJourneyId: Yup.string().when("stepType", {
        is: (stepType: number) => stepType === 4,
        then: Yup.string().required("Field is required"),
    }),
    schemaMappingId: Yup.string().when("stepType", {
        is: (stepType: number) => stepType === 5,
        then: Yup.string().required("Field is required"),
    }),
    flowbotSchemaId: Yup.string().when("stepType", {
        is: (stepType: number) => stepType === 6 || stepType === 11 || stepType === 12 || stepType === 13,
        then: Yup.string().required("Field is required"),
    }),
    userActionSchemaId: Yup.string().when("userActionType", {
        is: (autocompleteFunctionId: number) =>
            autocompleteFunctionId === 2 ||
            autocompleteFunctionId === 3 ||
            autocompleteFunctionId === 4 ||
            autocompleteFunctionId === 5,
        then: Yup.string().required("Field is required"),
    }),
    documentCollectionId: Yup.string().when("userActionType", {
        is: (autocompleteFunctionId: number) => autocompleteFunctionId === 7,
        then: Yup.string().required("Field is required"),
    }),
});

export function StepForm({
    values = INITIAL_VALUES,
    status,
    onDelete,
    onCancel,
    showActions,
    resetForm,
    handleSubmit,
    errors,
    touched,
    dropdownOptions: {
        schemas,
        stepTypes,
        userActionTypes,
        apiMethods,
        documentCollectionApi,
        schemaMappings,
        documentCollectionList,
        journeys,
        validationApiList,
    },
    handleChange: onValuesChange,
    setFieldValue,
    setStatus,
}: StepFormProps & FormikProps<Partial<JourneyStep>>) {
    // Todo Translations Modal props
    const [showTranslationModal, setShowTranslationModal] = useState<TranslationModalShowProps>(
        INITIAL_TRANSITION_MODALS_VALUES,
    );
    const [selectedField, setSelectedField] = useState<SelectedFieldProps>({ key: "", value: "" });

    // Todo Translations components
    const translationProps = {
        id: values.id,
        key: selectedField.key,
        fieldValue: selectedField.value,
    };

    const BaseTranslationManager = useTranslationsGeneric({
        ...translationProps,
        Component: AdminTranslationModal,
    });

    const TextAreaTranslationManager = useTranslationsGeneric({
        ...translationProps,
        Component: AdminTranslationModal.HtmlEditor,
    });

    if (values.userActionType) {
        values.userActionType = Number(values.userActionType);
    } else {
        // temporary fix until issue on BE is fixed
        values.userActionType = 1;
    }

    if (values.stepType) {
        values.stepType = Number(values.stepType);
    }

    const submitActions = {
        labels: useDefaultSubmitLiterals(),
        testAtId: [atId("djpa_jd_02_btn_cancel_edit_form"), atId("djpa_jd_02_btn_save_edit_form")],
    };

    const literals = useLiterals();

    const dropdownSchemas = useMemo(() => {
        return schemas
            .filter(
                (schema) =>
                    schema.label &&
                    schema.label
                        .toString()
                        .toLowerCase()
                        .includes(status?.filter?.toLowerCase() || ""),
            )
            .map((schema) => {
                return {
                    value: schema.value,
                    label: schema.label,
                    testAtId: atId("djpa_jd_02_lbl_flowbot_schema_" + schema.value),
                } as RichOption;
            });
    }, [schemas, status.filter]);
    const SearchFilter = (
        <>
            <BaseInput
                name={"filter"}
                placeholder={"Search"}
                value={status.filter}
                onChange={(e) => {
                    setStatus({ filter: e.target.value });
                }}
            />
        </>
    );

    // Todo Translation modal
    // This handler accepts :key-translation key , value-show or hide modal , name-name of input field
    // name prop is only for open modal case
    const handleTranslationsModal = (key: string, value: boolean, name?: string) => {
        if (name) {
            // @ts-ignore
            setSelectedField({ key: key, value: values[name], name: name });
        }
        setShowTranslationModal({
            ...INITIAL_TRANSITION_MODALS_VALUES,
            ...{ [key]: value },
        });
    };
    return (
        <>
            {" "}
            {showActions && (
                <Col style={{ display: "flex", flexDirection: "row-reverse", marginBottom: 8 }}>
                    <BaseButton.ButtonWithIcon
                        border
                        color="invert-danger"
                        height={18}
                        name="admBin"
                        width={18}
                        onClick={() => onDelete && onDelete()}
                    >
                        Delete
                    </BaseButton.ButtonWithIcon>
                </Col>
            )}
            <div>
                <BaseCard className="adm-card-journeys__form">
                    <Row className="form-item--first">
                        <Col className="form-item--padding-right">
                            <div>
                                <BaseInput
                                    name="stepName"
                                    value={values.stepName}
                                    onChange={(e) => onValuesChange && onValuesChange(e)}
                                    label={literals("djpa_jd_02_lbl_step_name")}
                                    testAtId={atId("djpa_jd_02_int_step_name")}
                                    labelTestAtId={atId("djpa_jd_02_lbl_step_name")}
                                    error={touched.stepName && errors.stepName}
                                />
                            </div>
                        </Col>
                        <Col className="form-item--padding-left">
                            <div>
                                <BaseInput
                                    name="stepTitle"
                                    label={literals("djpa_jd_02_lbl_step_title")}
                                    value={values.stepTitle}
                                    onChange={onValuesChange}
                                    // showTranslateButton={values.stepTitle===""?true:false}
                                    showTranslateButton={!!values.id}
                                    testAtId={atId("djpa_jd_02_int_step_title")}
                                    labelTestAtId={atId("djpa_jd_02_lbl_step_title")}
                                    onTranslateClick={() => handleTranslationsModal("step-title", true, "stepTitle")}
                                    error={touched?.stepTitle && errors.stepTitle}
                                />
                            </div>
                            {showTranslationModal["step-title"] && (
                                <BaseTranslationManager
                                    closeModal={(key: string, val: boolean) => handleTranslationsModal(key, val)}
                                />
                            )}
                        </Col>
                    </Row>
                    <Row className="form-item">
                        <Col className="form-item--padding-right">
                            <BaseSelect
                                className={"adm-select"}
                                value={values.stepType}
                                onChange={(ev) => {
                                    setFieldValue("userActionType", UserActionTypes.JustInformation);
                                    onValuesChange(ev);
                                }}
                                name={"stepType"}
                                width={10}
                                height={6}
                                options={stepTypes}
                                label={literals("djpa_jd_02_lbl_step_type")}
                                icon={{ name: "angle-down" }}
                                testAtId={atId("djpa_jd_02_sel_step_type")}
                                labelTestAtId={atId("djpa_jd_02_lbl_step_type")}
                                error={touched?.stepType && errors.stepType}
                            />
                        </Col>
                        {values.stepType === StepTypes.UserFacing ? (
                            <Col className="form-item--padding-left">
                                <BaseSelect
                                    className={"adm-select"}
                                    value={values.userActionType}
                                    onChange={onValuesChange}
                                    name={"userActionType"}
                                    width={10}
                                    height={6}
                                    options={userActionTypes}
                                    label={literals("djpa_jd_02_lbl_user_action_type")}
                                    icon={{ name: "angle-down" }}
                                    testAtId={atId("djpa_jd_02_sel_user_action_type")}
                                    labelTestAtId={atId("djpa_jd_02_lbl_user_action_type")}
                                />
                            </Col>
                        ) : (
                            <></>
                        )}
                        {values.stepType === StepTypes.SubProcess ? (
                            <Col className="form-item--padding-left">
                                <BaseSelect
                                    className={"adm-select"}
                                    value={values.subJourneyId}
                                    onChange={onValuesChange}
                                    name={"subJourneyId"}
                                    width={10}
                                    height={6}
                                    options={journeys}
                                    label={literals("djpa_jd_02_lbl_sub_journey")}
                                    icon={{ name: "angle-down" }}
                                    testAtId={atId("djpa_jd_02_sel_user_action_type")}
                                    labelTestAtId={atId("djpa_jd_02_lbl_sub_journey")}
                                    error={touched?.subJourneyId && errors.subJourneyId}
                                />
                            </Col>
                        ) : (
                            <></>
                        )}
                        {[
                            UserActionTypes.RecordDetails,
                            UserActionTypes.RecordEntry,
                            UserActionTypes.RecordSelector,
                            UserActionTypes.CheckHOSignature,
                        ].includes(values.userActionType ?? 0) ? (
                            // Reset filter
                            <Col className="form-item--padding-left" onClick={() => setStatus({ filter: "" })}>
                                <BaseSelect
                                    width={10}
                                    height={6}
                                    value={values.userActionSchemaId}
                                    onChange={onValuesChange}
                                    name={"userActionSchemaId"}
                                    options={dropdownSchemas}
                                    label={literals("djpa_jd_02_lbl_user_action_schema")}
                                    icon={{ name: "angle-down" }}
                                    testAtId={atId("djpa_jd_02_sel_user_action_schema")}
                                    labelTestAtId={atId("djpa_jd_02_lbl_user_action_schema")}
                                    filter={SearchFilter}
                                    error={touched?.userActionSchemaId && errors.userActionSchemaId}
                                />
                            </Col>
                        ) : (
                            <></>
                        )}
                        {values.userActionType === UserActionTypes.DocumentOverview ? (
                            <Col className="form-item--padding-left">
                                <BaseSelect
                                    width={10}
                                    height={6}
                                    className={"adm-select"}
                                    value={values.documentCollectionId}
                                    onChange={onValuesChange}
                                    name={"documentCollectionId"}
                                    options={documentCollectionList}
                                    label={literals("djpa_jd_02_lbl_user_document_collection")}
                                    icon={{ name: "angle-down" }}
                                    error={touched?.documentCollectionId && errors.documentCollectionId}
                                />
                            </Col>
                        ) : (
                            <></>
                        )}
                    </Row>

                    {values.userActionType === UserActionTypes.RecordEntry &&
                    values.stepType === StepTypes.UserFacing ? (
                        <Row className="form-item">
                            <Col>
                                <BaseSelect
                                    width={10}
                                    height={6}
                                    className={"adm-select"}
                                    value={values.autocompleteFunctionId}
                                    onChange={onValuesChange}
                                    name={"autocompleteFunctionId"}
                                    options={validationApiList}
                                    label={"Validation API"}
                                    icon={{ name: "angle-down" }}
                                />
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )}

                    {[
                        StepTypes.FlowBot,
                        StepTypes.ArchiveDocuments,
                        StepTypes.SignDocuments,
                        StepTypes.FetchDocuments,
                    ].includes(values.stepType || -1) ? (
                        <Row className="form-item">
                            <Col>
                                <BaseSelect
                                    width={10}
                                    height={6}
                                    className={"adm-select"}
                                    value={values.flowbotFunctionId}
                                    onChange={onValuesChange}
                                    name={"flowbotFunctionId"}
                                    options={
                                        values.stepType &&
                                        [
                                            StepTypes.ArchiveDocuments,
                                            StepTypes.FetchDocuments,
                                            StepTypes.SignDocuments,
                                        ].includes(values.stepType)
                                            ? documentCollectionApi
                                            : apiMethods
                                    }
                                    label={literals("djpa_jd_02_lbl_API_function")}
                                    icon={{ name: "angle-down" }}
                                    testAtId={atId("djpa_jd_02_sel_API_function")}
                                    labelTestAtId={atId("djpa_jd_02_lbl_API_function")}
                                    error={touched?.flowbotFunctionId && errors.flowbotFunctionId}
                                />
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )}
                    {values.stepType === StepTypes.FlowBotMapping ? (
                        <Row className="form-item">
                            <Col>
                                <BaseSelect
                                    width={10}
                                    height={6}
                                    className={"adm-select"}
                                    value={values.schemaMappingId}
                                    onChange={onValuesChange}
                                    name={"schemaMappingId"}
                                    options={schemaMappings}
                                    label={literals("djpa_jd_02_lbl_schema_mapping")}
                                    icon={{ name: "angle-down" }}
                                    testAtId={atId("djpa_jd_02_sel_schema_mapping")}
                                    labelTestAtId={atId("djpa_jd_02_lbl_schema_mapping")}
                                    error={touched?.schemaMappingId && errors.schemaMappingId}
                                />
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )}
                    {[
                        StepTypes.HalcomOneSign,
                        StepTypes.SendXMLFile,
                        StepTypes.ReceiveXMLFile,
                        StepTypes.WEBHookRestService,
                    ].includes(values.stepType || -1) ? (
                        <Row className="form-item">
                            <Col style={{ zIndex: 3 }} onClick={() => setStatus({ filter: "" })}>
                                <BaseSelect
                                    width={10}
                                    height={6}
                                    value={values.flowbotSchemaId}
                                    onChange={onValuesChange}
                                    name={"flowbotSchemaId"}
                                    options={dropdownSchemas}
                                    label={literals("djpa_jd_02_lbl_flowbot_schema")}
                                    icon={{ name: "angle-down" }}
                                    testAtId={atId("djpa_jd_02_sel_flowbot_schema")}
                                    labelTestAtId={atId("djpa_jd_02_lbl_flowbot_schema")}
                                    filter={SearchFilter}
                                    error={touched?.flowbotSchemaId && errors.flowbotSchemaId}
                                />
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )}
                    {values.stepType === StepTypes.UserFacing ? (
                        <Row className="form-item" style={{ alignItems: "center" }}>
                            <Col>
                                <BaseCheckbox
                                    className={"adm-checkbox"}
                                    name={"employeeFacingStep"}
                                    checked={values.employeeFacingStep}
                                    onChange={(e) => {
                                        setFieldValue("employeeFacingStep", e.currentTarget.checked);
                                    }}
                                    label={literals("djpa_jd_02_cbox_employee_facing_step")}
                                    testAtId={atId("djpa_jd_02_cbox_employee_facing_step")}
                                    labelTestAtId={atId("djpa_jd_02_cbox_employee_facing_step")}
                                />
                            </Col>
                            {values.stepType === 1 && values.employeeFacingStep === true && (
                                <Col>
                                    {/*    Todo add requiredRole - Add translations and test IDs*/}
                                    <BaseInput
                                        name="requiredRole"
                                        value={values.requiredRole}
                                        onChange={(e) => onValuesChange && onValuesChange(e)}
                                        label={"Required role"}
                                        testAtId={atId("djpa_jd_02_int_step_name")}
                                        labelTestAtId={atId("djpa_jd_02_lbl_step_name")}
                                    />
                                </Col>
                            )}
                        </Row>
                    ) : (
                        <></>
                    )}
                    <Row className="form-item--first">
                        <Col>
                            <BaseHtmlEditor
                                value={values.userMessage}
                                name="userMessage"
                                onChange={(fieldName, value) => setFieldValue(fieldName, value as string)}
                                label={literals("djpa_jd_02_lbl_user_message")}
                                translate={
                                    values.userMessage !== "<p><br></p>" &&
                                    values.id && (
                                        <TranslateButton
                                            onClick={() => handleTranslationsModal("user-message", true, "userMessage")}
                                            testAtId={atId("djpa_jd_02_btn_translations")}
                                        >
                                            {literals("djpa_common_00_btn_translations")}
                                        </TranslateButton>
                                    )
                                }
                                editorTestId={"djpa_jd_02_int_user_message"}
                                labelTestAtId={atId("djpa_jd_02_lbl_user_message")}
                            />
                            {showTranslationModal["user-message"] && (
                                <>
                                    <TextAreaTranslationManager
                                        closeModal={(key: string, val: boolean) => handleTranslationsModal(key, val)}
                                    />
                                </>
                            )}
                        </Col>
                    </Row>
                    {values.employeeFacingStep ? (
                        <Row className="form-item--first">
                            <Col>
                                <BaseHtmlEditor
                                    value={values.employeeMessage}
                                    name="employeeMessage"
                                    onChange={(fieldName, value) => setFieldValue(fieldName, value as string)}
                                    label={literals("djpa_jd_02_lbl_employee_message")}
                                    translate={
                                        values.employeeMessage !== "<p><br></p>" &&
                                        values.id && (
                                            <TranslateButton
                                                onClick={() =>
                                                    handleTranslationsModal("employee-message", true, "employeeMessage")
                                                }
                                                testAtId={atId("djpa_jd_02_btn_translations")}
                                            >
                                                {literals("djpa_common_00_btn_translations")}
                                            </TranslateButton>
                                        )
                                    }
                                    testAtId={atId("djpa_jd_02_lbl_employee_message")}
                                    labelTestAtId={atId("djpa_jd_02_lbl_employee_message")}
                                />
                                {showTranslationModal["employee-message"] && (
                                    <>
                                        <TextAreaTranslationManager
                                            closeModal={(key: string, val: boolean) =>
                                                handleTranslationsModal(key, val)
                                            }
                                        />
                                    </>
                                )}
                            </Col>
                        </Row>
                    ) : (
                        <></>
                    )}
                    <Row className="form-item">
                        <Col>
                            <BaseInput
                                value={values.stepDescription}
                                onChange={onValuesChange}
                                label={literals("djpa_sd_02_lbl_description")}
                                name="stepDescription"
                                onHelpClick={() => console.log("help me")}
                                subLabel={literals("djpa_common_00_lbl_optional")}
                                testAtId={atId("djpa_jd_02_int_description")}
                                labelTestAtId={atId("djpa_jd_02_lbl_description")}
                            />
                        </Col>
                    </Row>
                    {values.id && values.id !== CONSTANTS.JOURNEY.STEP.NEW && (
                        <Row className="form-item" style={{ paddingLeft: "15px" }}>
                            <EntityImage entityId={values.id} testAtId={atId("djpa_jd_02_btn_image")} />
                        </Row>
                    )}
                    <Row>
                        <Col>
                            <label className={"edit-step__help-label"} {...atId("djpa_jd_02_lbl_initial_terminaton")}>
                                {literals("djpa_jd_02_lbl_initial_terminaton")}
                                <span {...atId("edit-step__help-label")}>(?)</span>
                            </label>
                        </Col>
                    </Row>
                    <Row className="form-item--last">
                        <Col md={"auto"}>
                            <BaseCheckbox
                                className={"adm-checkbox"}
                                name={"initialStep"}
                                checked={!!values.initialStep}
                                onChange={(e) => setFieldValue("initialStep", e.currentTarget.checked)}
                                label={literals("djpa_jd_02_cbox_initial_step")}
                                testAtId={atId("djpa_jd_02_cbox_initial_step")}
                                labelTestAtId={atId("djpa_jd_02_lbl_initial_step")}
                                error={touched?.initialStep && errors.initialStep}
                            />
                        </Col>
                        <Col md={"auto"}>
                            <BaseCheckbox
                                className={"adm-checkbox"}
                                name={"terminationStep"}
                                checked={values.terminationStep}
                                onChange={(e) => setFieldValue("terminationStep", e.currentTarget.checked)}
                                label={literals("djpa_jd_02_cbox_termination_step")}
                                testAtId={atId("djpa_jd_02_cbox_termination_step")}
                                labelTestAtId={atId("djpa_jd_02_lbl_termination_step")}
                            />
                        </Col>

                        {values.terminationStep && (
                            <Col md={"auto"}>
                                <BaseCheckbox
                                    className={"adm-checkbox"}
                                    name={"terminalStepSuccess"}
                                    checked={values.terminalStepSuccess}
                                    onChange={(e) => setFieldValue("terminalStepSuccess", e.currentTarget.checked)}
                                    label={literals("djpa_jd_02_terminal_step_status_title")}
                                    testAtId={atId("djpa_jd_02_terminal_step_status_title")}
                                    labelTestAtId={atId("djpa_jd_02_terminal_step_status_title")}
                                />
                            </Col>
                        )}
                    </Row>
                </BaseCard>
                <Row className="form-item--last">
                    <Col className={"admin-submit-group-no-border journey-actions"}>
                        <AdminButtonsGroup.Submit
                            onClick={(isSubmit: boolean | number) => {
                                if (isSubmit) {
                                    handleSubmit();
                                } else {
                                    resetForm();
                                    onCancel && onCancel();
                                }
                            }}
                            labels={submitActions.labels}
                            testIds={submitActions.testAtId}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );
}
