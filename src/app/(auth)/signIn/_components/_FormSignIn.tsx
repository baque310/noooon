
"use client";
import { Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { ButtonForm } from '@/components/Form/ButtonForm';
import useLogic from './_logic';
import * as Yup from 'yup'; 

const FormSignIn = () => {
    const {
        handleSubmit,
        t,
        isLoading,
        signInSchema,
    } = useLogic();

    type SignInSchema = Yup.InferType<typeof signInSchema>;

    return (
        <div className="flex min-h-screen items-center justify-center bg-cover bg-center">
            <div className="panel m-6 w-full max-w-lg sm:w-[480px] Card">
                <h2 className="mb-1 text-2xl font-bold">{t("signInPage.signIn")}</h2>
                <p className="mb-4">{t("signInPage.signInDesc")}</p>
                <Formik<SignInSchema>
                    initialValues={{
                        username: "",
                        password: "",
                    }}
                    validationSchema={signInSchema}
                    onSubmit={handleSubmit}
                >
                    {(props: FormikProps<any>) => (
                        <Form className={"flex flex-col gap-4"}>
                            <InputForm
                                formikProps={props}
                                name={"username"}
                                title={t("signInPage.username")}
                                placeholder={t("signInPage.enter-username")}
                            />

                            <InputForm
                                formikProps={props}
                                name={"password"}
                                title={t("signInPage.password")}
                                placeholder={t("signInPage.enter-password")}
                                isPassword={true}
                            />

                            <ButtonForm
                                title={t("signInPage.signIn")}
                                isLoading={isLoading}
                                props={{
                                    className: "w-full",
                                    type: "submit",
                                }}
                            />
                        </Form>
                    )}
                </Formik> 
                <p className="mt-4 text-center">
                    <span className="font-bold text-primary hover:underline ltr:ml-1 rtl:mr-1">
                        {t("appName")}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default FormSignIn;
