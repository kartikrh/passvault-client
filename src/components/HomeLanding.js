"use client";

import Link from "next/link";
import { Card, CardBody, Col, Container, Row } from "reactstrap";

// Rendered for the CMS "Home" page (isLink page with linkURL "Home", see
// cmsComponentRegistry.js) -- its pageContent is null because it's a designed
// landing page, not rich text, so the copy/layout live here rather than in
// PassVaultpanel's page editor.
const FEATURES = [
  {
    icon: "bx-lock-alt",
    title: "End-to-end encryption",
    desc: "Every credential is encrypted before it ever leaves your device.",
  },
  {
    icon: "bx-devices",
    title: "Access anywhere",
    desc: "Your vault stays in sync across every device you sign in from.",
  },
  {
    icon: "bx-key",
    title: "Smart password health",
    desc: "Spot weak, reused, and old passwords before they become a problem.",
  },
  {
    icon: "bx-shield-quarter",
    title: "Built for privacy",
    desc: "We never see your master password, and we never sell your data.",
  },
];

export default function HomeLanding({ page }) {
  return (
    <>
      <section className="bg-light">
        <Container fluid className="py-5 px-4 text-center">
          <h1 className="display-5 fw-bold mb-3">
            {page?.pageHeading || "Simple, Secure & Private"}
          </h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: 640 }}>
            One vault for every password, note, and secret you need to remember
            &mdash; protected with strong encryption and built to stay out of your way.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            <Link href="/login" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link href="/about-us" className="btn btn-outline-secondary btn-lg">
              Learn More
            </Link>
          </div>
        </Container>
      </section>

      <Container fluid className="py-5 px-4">
        <Row className="g-4">
          {FEATURES.map((feature) => (
            <Col key={feature.title} sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <CardBody className="text-center p-4">
                  <i className={`bx ${feature.icon} text-primary`} style={{ fontSize: "2.25rem" }} />
                  <h5 className="mt-3">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.desc}</p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <section className="bg-primary bg-opacity-10">
        <Container fluid className="py-5 px-4 text-center">
          <h3 className="fw-bold mb-2">Ready to take control of your passwords?</h3>
          <p className="text-muted mb-4">
            Create your PassVault account and store your first credential in minutes.
          </p>
          <Link href="/login" className="btn btn-primary btn-lg">
            Get Started for Free
          </Link>
        </Container>
      </section>
    </>
  );
}
