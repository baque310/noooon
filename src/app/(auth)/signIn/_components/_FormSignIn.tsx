"use client";

import { Form, Formik, FormikProps } from "formik";
import useLogic from "./_logic";
import * as Yup from "yup";

/* ---------- Spinner SVG ---------- */
const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
    <path d="M22 12a10 10 0 00-10-10" strokeOpacity="0.75" />
  </svg>
);

const FormSignIn = () => {
  const { handleSubmit, t, isLoading, signInSchema } = useLogic();

  type SignInSchema = Yup.InferType<typeof signInSchema>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] px-5 py-5">
      <div className="w-full max-w-[1000px] rounded-[30px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-white">
        {/* ================= FORM SIDE ================= */}
        <div className="flex items-center justify-center p-8 lg:p-[60px] order-2 lg:order-1">
          <div className="w-full max-w-[400px] flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-[15px] mb-10">
              <div className="w-[45px] h-[45px] rounded-xl bg-[#8b5cf6] flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                  <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                  <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                </svg>
              </div>
              <div className="text-[1.4rem] font-extrabold text-[#111827]">{t("appName")}</div>
            </div>

            {/* Welcome */}
            <div className="mb-[30px]">
              <h2 className="text-[1.8rem] font-bold mb-[10px] text-[#111827]">{t("signInPage.signInWelcome")}</h2>
              <p className="text-[#6b7280] text-sm">{t("signInPage.signInDesc")}</p>
            </div>

            {/* ================= FORM ================= */}
            <Formik<SignInSchema> initialValues={{ username: "", password: "" }} validationSchema={signInSchema} onSubmit={handleSubmit}>
              {(props: FormikProps<any>) => (
                <Form className="flex flex-col gap-5">
                  {/* Username */}
                  <div>
                    <label className="block mb-2 text-[0.9rem] font-bold text-[#111827]">{t("signInPage.username")}</label>
                    <div className="relative">
                      <div className="absolute left-[15px] top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          <path d="M12 14c-4.418 0-8 2.015-8 4.5V21h16v-2.5c0-2.485-3.582-4.5-8-4.5z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="username"
                        placeholder={t("signInPage.enter-username")}
                        value={props.values.username}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        className="w-full py-[14px] pr-5 pl-[45px] border-2 border-[#e2e8f0] rounded-xl text-[0.95rem] bg-[#f8fafc] focus:bg-white focus:border-[#8b5cf6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] outline-none transition"
                      />
                    </div>
                    {props.errors.username && props.touched.username && <p className="text-red-500 text-xs mt-1">{props.errors.username as string}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block mb-2 text-[0.9rem] font-bold text-[#111827]">{t("signInPage.password")}</label>
                    <div className="relative">
                      <div className="absolute left-[15px] top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V8a5 5 0 0110 0v3" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="password"
                        placeholder={t("signInPage.enter-password")}
                        value={props.values.password}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        className="w-full py-[14px] pr-5 pl-[45px] border-2 border-[#e2e8f0] rounded-xl text-[0.95rem] bg-[#f8fafc] focus:bg-white focus:border-[#8b5cf6] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] outline-none transition"
                      />
                    </div>
                    {props.errors.password && props.touched.password && <p className="text-red-500 text-xs mt-1">{props.errors.password as string}</p>}
                  </div>

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 mt-[10px] bg-[#8b5cf6] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition hover:bg-[#7c3aed] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(139,92,246,0.2)] disabled:opacity-80">
                    {isLoading ? (
                      <>
                        <Spinner />
                        <span>جاري الدخول...</span>
                      </>
                    ) : (
                      <>
                        <span>{t("signInPage.signIn")}</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M15 19l-7-7 7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Footer */}
            <p className="mt-5 pt-5 text-center text-[0.85rem] text-[#6b7280]">&copy; 2026 {t("appName")}</p>
          </div>
        </div>

        {/* ================= ART SIDE ================= */}
        <div className="hidden lg:flex flex-col items-center justify-center bg-[#8b5cf6] text-white p-10 relative overflow-hidden order-1 lg:order-2">
          <div
            className="absolute inset-[-50%] animate-[rotateBg_20s_linear_infinite]"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 60%)" }}
          />
          <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full" style={{ background: "rgba(255,255,255,.05)" }} />

          <div className="relative z-10 text-center px-10">
            <div className="mx-auto mb-5 w-[120px] h-[120px] rounded-[30px] flex items-center justify-center backdrop-blur-sm" style={{ background: "rgba(255,255,255,.2)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-16">
                <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
              </svg>
            </div>

            <h1 className="text-[2rem] font-extrabold mb-[15px]">نظام الإدارة المدرسية</h1>
            <p className="opacity-90 leading-relaxed">منصة متكاملة لإدارة شؤون الطلاب، الكادر التعليمي، والعمليات الإدارية بكفاءة وسهولة.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes rotateBg {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FormSignIn;
