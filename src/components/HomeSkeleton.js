"use client";

import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Skeleton from "@/components/Skeleton";

const FEATURE_COUNT = 4; // matches HomeLanding's FEATURES

// Shown by CmsPageView while usePages' initial fetch is in flight and the
// resolved slug is "home" -- shaped like HomeLanding's hero/features/CTA
// bands so a reload of "/" doesn't flash a bare "Loading..." line before
// snapping into the real layout.
export default function HomeSkeleton() {
  return (
    <div className="placeholder-glow">
      <section className="bg-light">
        <Container fluid className="py-5 px-4 text-center">
          <Skeleton height={40} width="60%" className="mx-auto mb-3" />
          <Skeleton height={16} width="70%" className="mx-auto mb-2" />
          <Skeleton height={16} width="50%" className="mx-auto mb-4" />
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Skeleton width={140} height={46} style={{ borderRadius: 6 }} />
            <Skeleton width={140} height={46} style={{ borderRadius: 6 }} />
          </div>
        </Container>
      </section>

      <Container fluid className="py-5 px-4">
        <Row className="g-4">
          {Array.from({ length: FEATURE_COUNT }).map((_, index) => (
            <Col key={index} sm={6} lg={3}>
              <Card className="h-100 border-0 shadow-sm">
                <CardBody className="text-center p-4">
                  <Skeleton width={36} height={36} className="mx-auto mb-3" style={{ borderRadius: "50%" }} />
                  <Skeleton height={16} width="60%" className="mx-auto mb-2" />
                  <Skeleton height={12} className="mb-1" />
                  <Skeleton height={12} width="80%" className="mx-auto" />
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <section className="bg-primary bg-opacity-10">
        <Container fluid className="py-5 px-4 text-center">
          <Skeleton height={24} width="40%" className="mx-auto mb-2" />
          <Skeleton height={14} width="55%" className="mx-auto mb-4" />
          <Skeleton width={180} height={46} className="mx-auto" style={{ borderRadius: 6 }} />
        </Container>
      </section>
    </div>
  );
}
