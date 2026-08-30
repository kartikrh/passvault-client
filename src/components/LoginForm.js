"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Alert,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
} from "reactstrap";
import ReCAPTCHA from "react-google-recaptcha";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import axiosInstance from "@/lib/api";
import { useWhitelabel } from "@/lib/useWhitelabel";

// Registered in cmsComponentRegistry.js under linkURL "login" -- resolved
// and rendered by CmsPageView (src/components/CmsPageView.js) exactly like
// HomeLanding, so /login gets the same SiteNav header as every other CMS
// page and its CMS "login" record (PassVaultpanel > Pages) drives the tab
// title the same way every other page's does.
export default function LoginForm() {
  const router = useRouter();
  const { whitelabel } = useWhitelabel();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Both driven by the admin's White Label config (PassVaultpanel > White
  // Label), not hardcoded here -- an operator can flip either on/off, or
  // swap keys, without a frontend deploy.
  const recaptchaRequired = !!whitelabel?.isRecatchEnable && !!whitelabel?.recatchKey;
  const googleEnabled = !!whitelabel?.isGoogleLogin && !!whitelabel?.googleKey;

  // The Google button needs a pixel width (no "100%" support), so measure
  // its wrapper to make it stretch edge-to-edge like the Log In button above it.
  const googleButtonWrapperRef = useRef(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(300);

  useEffect(() => {
    if (!googleEnabled) return;
    const updateWidth = () => {
      if (googleButtonWrapperRef.current) {
        setGoogleButtonWidth(googleButtonWrapperRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [googleEnabled]);

  const validation = useFormik({
    initialValues: { identifier: "", password: "" },
    validationSchema: Yup.object({
      // Could be an email or a username (PassVaultapi's loginService routes
      // by shape -- "@" present means email, otherwise username), so this
      // only checks presence, not email format.
      identifier: Yup.string().required("Please enter your email or username"),
      password: Yup.string().required("Please enter your password"),
    }),
    onSubmit: async (values) => {
      if (recaptchaRequired && !captchaToken) {
        setErrorMessage("Please complete the reCAPTCHA challenge.");
        return;
      }
      setErrorMessage(null);
      setIsSubmitting(true);
      try {
        await axiosInstance.post("/vault/auth/login", {
          identifier: values.identifier,
          password: values.password,
          ...(recaptchaRequired ? { recaptchaToken: captchaToken } : {}),
        });
        router.push("/dashboard");
      } catch (err) {
        setErrorMessage(err?.message || "Unable to sign in. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleGoogleCredential = async (credentialResponse) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      // This one is live today -- PassVaultapi's POST /vault/auth/google
      // already verifies the ID token and finds-or-creates the client.
      await axiosInstance.post("/vault/auth/google", {
        idToken: credentialResponse.credential,
      });
      router.push("/dashboard");
    } catch (err) {
      setErrorMessage(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // .account-pages/.bg-overlay (a position:absolute, inset:0 dark layer)
    // had no background image behind it anywhere in this stylesheet -- it
    // was dead template scaffolding that did nothing but sit on top of
    // SiteNav and swallow every click on the menu. Replaced with a plain
    // tinted backdrop so the login page still reads as its own distinct
    // section instead of a bare content page like About Us/News.
    <div className="bg-primary bg-opacity-10 min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={6} md={8} xl={4}>
            <Card>
              <CardBody className="p-4">
                <div className="text-center">
                  <Link href="/" className="text-decoration-none">
                    <h3 className="text-primary fw-bold mb-0">PassVault</h3>
                  </Link>
                </div>
                <h4 className="font-size-18 text-muted mt-2 text-center mb-4">Welcome back</h4>

                <Form
                  className="form-horizontal"
                  onSubmit={(e) => {
                    e.preventDefault();
                    validation.handleSubmit();
                  }}
                >
                  {errorMessage && <Alert color="danger">{errorMessage}</Alert>}

                  <div className="mb-3">
                    <Label className="form-label">Email or Username</Label>
                    <Input
                      name="identifier"
                      type="text"
                      placeholder="Enter email or username"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.identifier}
                      invalid={!!(validation.touched.identifier && validation.errors.identifier)}
                    />
                    {validation.touched.identifier && validation.errors.identifier ? (
                      <FormFeedback type="invalid">{validation.errors.identifier}</FormFeedback>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <Label className="form-label">Password</Label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.password}
                      invalid={!!(validation.touched.password && validation.errors.password)}
                    />
                    {validation.touched.password && validation.errors.password ? (
                      <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                    ) : null}
                  </div>

                  <div className="text-end mb-3">
                    <Link href="/forgot-password" className="text-muted">
                      <i className="mdi mdi-lock" /> Forgot your password?
                    </Link>
                  </div>

                  {recaptchaRequired ? (
                    <div className="mb-3 d-flex justify-content-center">
                      <ReCAPTCHA sitekey={whitelabel.recatchKey} onChange={setCaptchaToken} />
                    </div>
                  ) : null}

                  <div className="d-grid mt-3">
                    <button className="btn btn-primary waves-effect waves-light" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Signing in..." : "Log In"}
                    </button>
                  </div>

                  {googleEnabled ? (
                    <div className="mt-4">
                      <hr className="my-4" />
                      <div ref={googleButtonWrapperRef} className="w-100">
                        <GoogleOAuthProvider clientId={whitelabel.googleKey}>
                          <GoogleLogin
                            onSuccess={handleGoogleCredential}
                            onError={() => setErrorMessage("Google sign-in failed. Please try again.")}
                            theme="filled_blue"
                            shape="rectangular"
                            size="large"
                            width={String(googleButtonWidth)}
                          />
                        </GoogleOAuthProvider>
                      </div>
                    </div>
                  ) : null}
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
