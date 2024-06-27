import { BaseModal, BaseSpinner, MenuWithIcon, RichOption } from "@halcom/halui";
import { withFormik } from "formik";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../../../../assets/css/components/_JourneyDetailsStep.scss";
import { atId } from "../../../../libs/common/atid";
import {
    ApiCall,
    DocumentCollectionType,
    Journey,
    JourneyStep,
    JourneyStepPayload,
    Schema,
    SchemaMapping,
    UserActionType,
} from "../../../../libs/openapi";
import { useAppConfig, useLiterals } from "../../../../logic/hooks";
import { useApi } from "../../../../logic/hooks/api";
import { CONSTANTS } from "../../../../logic/utils/constants";
import { notify } from "../../../../logic/utils/helpers";
import AdminDeleteModal from "../../modals/AdminDeleteModal";
import Menu from "./Menu";
import { StepForm, stepValidation } from "./StepForm";
import { StepFormProps, StepTypes, UserActionTypes } from "./StepForm.interface";
import StepsEdit from "./StepsEdit";
import StepsTransitions from "./StepsTransitions";
import Tabs from "./Tabs";

function getBlankStep(): JourneyStep {
    return {
        id: CONSTANTS.JOURNEY.STEP.NEW,
        stepType: StepTypes.None,
        stepName: "",
        stepTitle: "",
        userMessage: "",
        stepDescription: "",
        documentCollectionId: "",
        initialStep: false,
        terminationStep: false,
        userActionType: 1,
        autocompleteFunctionId: CONSTANTS.VALIDATION_API.NONE,
    } as JourneyStep;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleansePayload(baseHash: { [key: string]: any }) {
    const keys = Object.keys(baseHash);
    for (const key of keys) {
        if (typeof baseHash[key] === "string") {
            baseHash[key] = baseHash[key].trim();
        }
    }
    return baseHash;
}

function JourneyDetailsSteps() {
    const [selectedStep, setSelectedStep] = useState<JourneyStep>();
    const [stepTypes, setStepTypes] = useState<RichOption[]>([]);
    const [schemas, setSchemas] = useState<RichOption[]>([]);
    const [userActionTypes, setUserActionTypes] = useState<RichOption[]>([]);
    const [apiMethods, setApiMethods] = useState<RichOption[]>([]);
    const [schemaMappings, setSchemaMappings] = useState<RichOption[]>([]);
    const [documentCollectionList, setDocumentCollectionList] = useState<RichOption[]>([]);
    const [journeys, setJourneys] = useState<RichOption[]>([]);
    const [showDelete, setShowDelete] = useState(false);
    const navigate = useNavigate();
    const config = useAppConfig();
    const [show, setShow] = useState(false);
    const [blankStep, setBlankStep] = useState<JourneyStep>();
    const [validationApiList, setValidationApiList] = useState<RichOption[]>([]);
    const [documentCollectionApi, setDocumentCollectionApi] = useState<RichOption[]>([]);

    const api = useApi();
    const literals = useLiterals();
    const { journeyId, tab, id } = useParams();
    const [loading, setLoading] = useState(true);

    const [steps, setSteps] = useState<JourneyStep[]>([]);

    const ModalTitle = () => (
        <div className={"new-step-title"} {...atId("djpa_jd_02_lbl_new_step")}>
            {literals("djpa_jd_02_lbl_new_step")}
        </div>
    );

    const noValidation = useMemo(() => {
        return {
            id: CONSTANTS.VALIDATION_API.NONE,
            operationId: "no validation",
        } as ApiCall;
    }, []);

    useEffect(() => {
        api.APIDefinition?.getSchemaFlowBotApiMethods()
            .then((response) => {
                const validatedApi = [noValidation].concat(response.filter((item) => item.apiType === 4));
                setValidationApiList(
                    validatedApi.map(
                        (mapping) =>
                            ({
                                value: mapping.id!,
                                label: mapping.operationId!,
                                testAtId: atId("djpa_jd_02_lbl_API_validate_" + mapping.id),
                            } as RichOption),
                    ),
                );
                const flowbotApi = response.filter((item) => item.apiType !== 4);
                setApiMethods(
                    flowbotApi.map(
                        (method) =>
                            ({
                                value: method.id!,
                                label: method.operationId!,
                                testAtId: atId("djpa_jd_02_lbl_API_function_" + method.id),
                            } as RichOption),
                    ),
                );
                const documentApi = response.filter((item) => item.apiType === 2);
                setDocumentCollectionApi(
                    documentApi.map(
                        (method) =>
                            ({
                                value: method.id!,
                                label: method.operationId!,
                                testAtId: atId("djpa_jd_02_lbl_API_document_" + method.id),
                            } as RichOption),
                    ),
                );
            })
            .catch((error) => {
                console.log(error);
            });
    }, [api.APIDefinition, noValidation]);

    const getSteps = useCallback(async () => {
        setLoading(true);
        try {
            journeyId &&
                api.adminJourneyStepAdministration
                    ?.getJurneysSteps({ journeyId })
                    .then((res) => setSteps(res))
                    .then(() => setLoading(false));
        } catch (error) {
            console.log(error);
        }
    }, [journeyId, api.adminJourneyStepAdministration]);

    // Todo - I assume the page is loading here
    useEffect(() => {
        getSteps();
    }, [getSteps]);

    // Z združitvijo vseh klicev v eno enotno funkcijo fetchData zagotavljamo, da so vsi potrebni podatki pridobljeni v enem ciklu
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    schemaMappingsResponse,
                    documentCollectionTypesResponse,
                    journeysResponse,
                    stepTypesResponse,
                    schemasResponse,
                    userActionTypesResponse,
                ] = await Promise.all([
                    api.adminSchemaMapping?.getAllSchemaMappings() as Promise<SchemaMapping[]>,
                    api.documentCollectionApi?.getDocumentCollectionTypes() as Promise<DocumentCollectionType[]>,
                    api.adminJourney?.getJurneys() as Promise<Journey[]>,
                    api.register?.getStepTypes(),
                    api.adminSchema?.getSchemas() as Promise<Schema[]>,
                    api.register?.getUserActionTypes() as Promise<UserActionType[]>,
                ]);
    
                setSchemaMappings(
                    schemaMappingsResponse.map(
                        (mapping) => ({
                            value: mapping.id!,
                            label: mapping.description!,
                            testAtId: atId("djpa_jd_02_lbl_schema_mapping" + mapping.id),
                        }) as RichOption
                    )
                );
    
                setDocumentCollectionList(
                    documentCollectionTypesResponse.map(
                        (mapping) => ({
                            value: mapping.id!,
                            label: mapping.name!,
                            testAtId: atId("djpa_jd_02_lbl_API_document_collection_" + mapping.id),
                        }) as RichOption
                    )
                );
    
                setJourneys(
                    journeysResponse.map(
                        (_journey) => ({
                            value: _journey.id,
                            label: _journey.journeyName,
                            testAtId: atId("djpa_jd_02_lbl_sub_journey_" + _journey.id),
                        }) as RichOption
                    )
                );
    
                setStepTypes(
                    stepTypesResponse.map(
                        (type) => ({
                            value: type.id!,
                            label: type.typeName!,
                            testAtId: atId("djpa_jd_02_lbl_step_type_" + type.id),
                        }) as RichOption
                    )
                );
    
                setSchemas(
                    schemasResponse.map(
                        (schema) => ({
                            value: schema.id,
                            label: schema.objectName,
                            testAtId: atId("djpa_jd_02_lbl_user_action_schema_" + schema.id),
                        }) as RichOption
                    )
                );
    
                setUserActionTypes(
                    userActionTypesResponse.map(
                        (action) => ({
                            value: action.id!,
                            label: action.actionTypeDesc!,
                            testAtId: atId("djpa_jd_02_sv_useractiontype_" + action.id),
                        }) as RichOption
                    )
                );
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, [api]);


    useEffect(() => {
        if (!id && steps && steps.length > 0) {
            navigate(`${config.basename}/journey/${journeyId}/${tab ?? "step"}/${steps[0].id}`, { replace: true });
        }
    }, [id, steps, tab, journeyId, navigate, config.basename]);

    useEffect(() => {
        if (id && steps) {
            if (id === CONSTANTS.JOURNEY.STEP.NEW) {
                setSelectedStep(getBlankStep());
            } else {
                setSelectedStep(steps.find((step) => step.id === id));
            }
        }
    }, [id, steps]);


    const onTabClickSwitcher = useCallback(
        (tab: number | string) => {
            if (id) {
                navigate(`${config.basename}/journey/${journeyId}/${tab}/${id}`, { replace: true });
            } else {
                navigate(`${config.basename}/journey/${journeyId}/${tab}`, { replace: true });
            }
        },
        [journeyId, id, navigate, config.basename],
    );

    const handleStepClick = useCallback(
        (step: JourneyStep) => {
            navigate(`${config.basename}/journey/${journeyId}/${tab}/${step.id}`, { replace: true });
        },
        [tab, journeyId, navigate, config.basename],
    );

    const onSubmit = useCallback(
        (step: Partial<JourneyStep>) => {
            if (step && step.stepType) {
                if (step.stepType !== StepTypes.UserFacing) {
                    // TODO: this is a temporary fix until the issue is fixed on backend
                    step.userActionType = 1;
                }
                if (
                    ![
                        StepTypes.FlowBot,
                        StepTypes.ArchiveDocuments,
                        StepTypes.SignDocuments,
                        StepTypes.FetchDocuments,
                    ].includes(step.stepType)
                ) {
                    step.flowbotFunctionId = undefined;
                }

                if (step.stepType !== StepTypes.SubProcess) {
                    step.subJourneyId = undefined;
                }

                if (step.stepType !== StepTypes.FlowBotMapping) {
                    step.schemaMappingId = undefined;
                }
                if (
                    ![
                        UserActionTypes.RecordDetails,
                        UserActionTypes.RecordEntry,
                        UserActionTypes.RecordSelector,
                        UserActionTypes.CheckHOSignature,
                    ].includes(step.userActionType as UserActionTypes)
                ) {
                    step.userActionSchemaId = undefined;
                }

                if (UserActionTypes.DocumentOverview !== step.userActionType) {
                    step.documentCollectionId = undefined;
                }
                if (!step.terminationStep) {
                    step.terminalStepSuccess = undefined;
                }

                if (step.autocompleteFunctionId === CONSTANTS.VALIDATION_API.NONE) {
                    step.autocompleteFunctionId = undefined;
                }
                if (step.flowbotSchemaId === "") {
                    step.flowbotSchemaId = undefined;
                }
            }
            if ((selectedStep || step) && journeyId) {
                if ((step.id === CONSTANTS.JOURNEY.STEP.NEW || !step.id) && step) {
                    const { id, ...journeyStepPayload } = step;
                    journeyStepPayload.initialStep = !!journeyStepPayload.initialStep;
                    journeyStepPayload.terminationStep = !!journeyStepPayload.terminationStep;
                    try {
                        const createJourneyStep = api.adminJourneyStepAdministration
                            ?.createJourneyStep({
                                journeyId,
                                journeyStepPayload: cleansePayload(journeyStepPayload) as unknown as JourneyStepPayload,
                            })
                            .then((response) => {
                                steps.push(response);
                                setSteps([...steps]);
                                setShow(false);
                            });
                        if (createJourneyStep) {
                            setShow(true);
                            notify(createJourneyStep);
                        }
                    } catch (e) {
                        setShow(true);
                    }
                } else {
                    if (step) {
                        const { id, ...journeyStepPayload } = step;
                        journeyStepPayload.initialStep = !!journeyStepPayload.initialStep;
                        journeyStepPayload.terminationStep = !!journeyStepPayload.terminationStep;
                        journeyStepPayload.stepType = Number(journeyStepPayload.stepType);
                        try {
                            const updateJourneyStep = api.adminJourneyStepAdministration
                                ?.updateJourneyStep({
                                    journeyId,
                                    stepId: step.id!,
                                    journeyStepPayload: cleansePayload(
                                        journeyStepPayload,
                                    ) as unknown as JourneyStepPayload,
                                })
                                .then(() => {
                                    let index = steps.findIndex((_step) => _step.id === step.id);
                                    if (index >= 0) {
                                        steps[index] = {
                                            ...steps[index],
                                            ...journeyStepPayload,
                                        };

                                        setSteps([...steps]);
                                    }
                                });
                            if (updateJourneyStep) {
                                notify(updateJourneyStep);
                            }
                        } catch (e) {}
                    }
                }
            }
        },
        [selectedStep, journeyId, api.adminJourneyStepAdministration, steps],
    );

    const handleDeleteClick = useCallback(() => {
        if (selectedStep && journeyId) {
            try {
                const deleteJourneyStep = api.adminJourneyStepAdministration
                    ?.deleteJourneyStep({ journeyId, stepId: selectedStep.id })
                    .then(() => {
                        const { id } = selectedStep;
                        if (id) {
                            const updatedSteps = steps.filter((step) => step.id !== id);
                            setSteps([...updatedSteps]);
                            setSelectedStep({ ...steps[0] });
                            navigate(`${config.basename}/journey/${journeyId}/${tab}/${steps[0].id}`, {
                                replace: true,
                            });
                        }
                    });
                if (deleteJourneyStep) {
                    notify(deleteJourneyStep);
                }
            } catch (e) {}
        }
    }, [api, selectedStep, journeyId, steps, navigate, tab, config.basename]);

    const onNewStepClick = useCallback(() => {
        setBlankStep(getBlankStep());
        setShow(true);
    }, [setShow]);

    const journeyInitialStep = () => {
        const initialStep = steps.filter((e) => e.initialStep);
        if (initialStep.length) return initialStep[0].stepName;
    };

    const EditStepForm = withFormik<StepFormProps, Partial<JourneyStep>>({
        mapPropsToValues: (props) => {
            return {
                ...selectedStep,
                autocompleteFunctionId: selectedStep?.autocompleteFunctionId || CONSTANTS.VALIDATION_API.NONE,
            } as Partial<JourneyStep>;
        },

        handleSubmit: async (values) => {
            await handleSubmitStepForm(values);
        },

        validationSchema: stepValidation,

        mapPropsToStatus: () => {
            return {
                filter: "",
            };
        },

        displayName: "EditJourneyStepForm",
    })(StepForm);

    const NewStepForm = withFormik<StepFormProps, Partial<JourneyStep>>({
        mapPropsToValues: (props) => {
            return {
                stepName: blankStep?.stepName || "",
                stepTitle: blankStep?.stepTitle || "",
                stepType: blankStep?.stepType || 0,
                userActionType: blankStep?.userActionType || 0,
                userActionSchemaId: blankStep?.userActionSchemaId || "",
                userMessage: blankStep?.userMessage || "",
                stepDescription: blankStep?.stepDescription || "",
                initialStep: blankStep?.initialStep || false,
                terminationStep: blankStep?.terminationStep || false,
                flowbotSchemaId: blankStep?.flowbotSchemaId || "",
                flowbotFunctionId: blankStep?.flowbotFunctionId || "",
                documentCollectionId: blankStep?.documentCollectionId || "",
                autocompleteFunctionId: blankStep?.autocompleteFunctionId || CONSTANTS.VALIDATION_API.NONE,
                requiredRole: blankStep?.requiredRole || "",
                schemaMappingId: blankStep?.schemaMappingId || "",
                subJourneyId: blankStep?.subJourneyId || "",
            } as Partial<JourneyStep>;
        },
        mapPropsToStatus: () => {
            return {
                filter: "",
            };
        },

        validationSchema: stepValidation,

        handleSubmit: async (values, { setSubmitting }) => {
            await handleSubmitStepForm(values);
        },

        displayName: "AdminEditJourneyStepForm",
    })(StepForm);

    //Ločena metoda handleSubmitStepForm, da ni podvojena v NewStepForm in EditStepForm
    const handleSubmitStepForm = async (values: Partial<JourneyStep>) => {
        if (!values.employeeFacingStep) {
            values.employeeMessage = undefined;
        }
        if (values.initialStep) {
            if (steps.filter((e) => e.initialStep).length === 0) {
                onSubmit(values);
            } else {
                toast.error(literals("djpa_jd_02_err_initial_step", { stepName: `"${journeyInitialStep()}"` }));
                values.initialStep = false;
            }
        } else {
            onSubmit(values);
        }
    };

    const deleteModalHandler = (id: number | boolean) => {
        if (id === 2) {
            handleDeleteClick();
        }
        setShowDelete(false);
    };

    return (
        <Fragment>
            <Row>
                <Col md={3}>
                    <Menu
                        selected={id}
                        steps={steps}
                        onNewStepClick={onNewStepClick}
                        onStepClick={handleStepClick}
                        testAtId={atId("djpa_jd_02_lbl_created_steps")}
                        rowTestAtId={(row: MenuWithIcon) => {
                            return atId(row["title"] as string);
                        }}
                    />
                </Col>
                <Col md={9}>
                    <Tabs selected={tab} onClick={onTabClickSwitcher} />
                    <div />
                    {tab === "step" && steps.length > 0 ? (
                        <StepsEdit
                            onDeleteClick={() => setShowDelete(true)}
                            onDuplicateClick={() => {}}
                            step={selectedStep}
                        >
                            {loading ? (
                                <BaseSpinner />
                            ) : (
                                <EditStepForm
                                    dropdownOptions={{
                                        schemas,
                                        stepTypes,
                                        userActionTypes,
                                        apiMethods,
                                        documentCollectionApi,
                                        schemaMappings,
                                        documentCollectionList,
                                        journeys,
                                        validationApiList,
                                    }}
                                />
                            )}
                        </StepsEdit>
                    ) : tab === "transitions" && steps.length > 0 ? (
                        <StepsTransitions stepId={id} />
                    ) : (
                        <></>
                    )}
                </Col>
            </Row>
            <BaseModal.AdmModal show={show} className={"new-step-modal"}>
                <ModalTitle />
                <StepsEdit onDeleteClick={() => setShowDelete(true)} onDuplicateClick={() => {}} step={blankStep}>
                    <NewStepForm
                        dropdownOptions={{
                            schemas,
                            stepTypes,
                            userActionTypes,
                            apiMethods,
                            documentCollectionApi,
                            schemaMappings,
                            documentCollectionList,
                            journeys,
                            validationApiList,
                        }}
                        onCancel={() => setShow(false)}
                    />
                </StepsEdit>
            </BaseModal.AdmModal>
            <AdminDeleteModal
                show={showDelete}
                handler={deleteModalHandler}
                title={"djpa_common_00_lbl_title_delete"}
                bodyText={"djpa_jd_01_lbl_warn_delete_step"}
                bodyArg={{ stepName: selectedStep?.stepName || "" }}
            />
        </Fragment>
    );
}

export default JourneyDetailsSteps;
