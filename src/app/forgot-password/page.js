"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Row } from "reactstrap";

import axiosInstance from "@/lib/api";

export default function ForgotPasswordPage() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(null);

  const validation = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Enter a valid email").required("Please enter your email"),
    }),
    onSubmit: async (values) => {
      setErrorMessage(null);
      setIsSubmitting(true);
      try {
        // Not live yet -- see the project plan's Phase 0 (POST /vault/auth/forgotPassword).
        await axiosInstance.post("/vault/auth/forgotPassword", { email: values.email });
        setSubmittedEmail(values.email);
      } catch (err) {
        setErrorMessage(err?.message || "Unable to send the reset link. Please try again.");
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
                <h4 className="font-size-18 text-muted mt-2 text-center">Forgot your password?</h4>
                <p className="mb-4 text-center">We&apos;ll email you a link to reset it.</p>

                {submittedEmail ? (
                  <Alert color="success">
                    If an account exists for <strong>{submittedEmail}</strong>, a reset link is on
                    its way.
                  </Alert>
                ) : (
                  <Form
                    className="form-horizontal"
                    onSubmit={(e) => {
                      e.preventDefault();
                      validation.handleSubmit();
                    }}
                  >
                    {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
                    <div className="mb-3">
                      <Label className="form-label">Email</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Enter email"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.email}
                        invalid={!!(validation.touched.email && validation.errors.email)}
                      />
                      {validation.touched.email && validation.errors.email ? (
                        <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                      ) : null}
                    </div>
                    <div className="d-grid mt-3">
                      <button className="btn btn-primary waves-effect waves-light" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send reset link"}
                      </button>
                    </div>
                  </Form>
                )}
              </CardBody>
            </Card>
            <div className="mt-5 text-center">
              <p className="text-white-50">
                Remembered it?{" "}
                <Link href="/login" className="fw-medium text-primary">
                  Log In
                </Link>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
