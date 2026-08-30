"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Row } from "reactstrap";

import axiosInstance from "@/lib/api";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState(token ? "verifying" : "missing");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    axiosInstance
      .post("/vault/auth/verifyEmail", { token })
      .then(() => setStatus("verified"))
      .catch((err) => {
        setErrorMessage(err?.message || "This verification link is invalid or has expired.");
        setStatus("error");
      });
    // Only ever needs to run once per link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validation = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      password: Yup.string().min(8, "At least 8 characters").required("Please choose a password"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    }),
    onSubmit: async (values) => {
      setErrorMessage(null);
      setIsSubmitting(true);
      try {
        await axiosInstance.post("/vault/auth/setPassword", { newPassword: values.password });
        router.push("/dashboard");
      } catch (err) {
        setErrorMessage(err?.message || "Unable to set your password. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="account-pages my-5 pt-5">
      <div className="bg-overlay" />
      <Container>
        <Row className="justify-content-center">
          <Col lg={6} md={8} xl={4}>
            <Card>
              <CardBody className="p-4">
                <div className="text-center">
                  <Link href="/login" className="text-decoration-none">
                    <h3 className="text-primary fw-bold mb-0">PassVault</h3>
                  </Link>
                </div>

                {status === "missing" && (
                  <>
                    <h4 className="font-size-18 text-muted mt-2 text-center">Missing link</h4>
                    <Alert color="danger" className="mt-3">
                      This page needs a verification link -- open the one from your email.
                    </Alert>
                  </>
                )}

                {status === "verifying" && (
                  <>
                    <h4 className="font-size-18 text-muted mt-2 text-center">Verifying your email...</h4>
                    <p className="text-center text-muted">One moment.</p>
                  </>
                )}

                {status === "error" && (
                  <>
                    <h4 className="font-size-18 text-muted mt-2 text-center">Verification failed</h4>
                    <Alert color="danger" className="mt-3">{errorMessage}</Alert>
                    <p className="text-center text-muted">
                      <Link href="/login" className="text-primary">Back to sign in</Link>
                    </p>
                  </>
                )}

                {status === "verified" && (
                  <>
                    <h4 className="font-size-18 text-muted mt-2 text-center">Email verified</h4>
                    <p className="mb-4 text-center">Set a password to finish creating your account.</p>

                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                      }}
                    >
                      {errorMessage && <Alert color="danger">{errorMessage}</Alert>}

                      <div className="mb-3">
                        <Label className="form-label">New password</Label>
                        <Input
                          name="password"
                          type="password"
                          placeholder="At least 8 characters"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.password}
                          invalid={!!(validation.touched.password && validation.errors.password)}
                        />
                        {validation.touched.password && validation.errors.password ? (
                          <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">Confirm password</Label>
                        <Input
                          name="confirmPassword"
                          type="password"
                          placeholder="Re-enter your password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.confirmPassword}
                          invalid={!!(validation.touched.confirmPassword && validation.errors.confirmPassword)}
                        />
                        {validation.touched.confirmPassword && validation.errors.confirmPassword ? (
                          <FormFeedback type="invalid">{validation.errors.confirmPassword}</FormFeedback>
                        ) : null}
                      </div>

                      <div className="d-grid mt-3">
                        <button className="btn btn-primary waves-effect waves-light" type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Set password"}
                        </button>
                      </div>
                    </Form>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
