"use client";

import { Card, CardBody, Col, Row } from "reactstrap";
import Skeleton from "@/components/Skeleton";

const CARD_COUNT = 8; // matches profile/page.js's SECTIONS
const NAV_LINK_COUNT = 8;

// Shown while useFullProfile's initial fetch is in flight -- shaped like
// the real two-column layout (sidebar + stacked cards, see profile/page.js)
// so the page doesn't jump once real content replaces it.
export default function ProfileSkeleton() {
  return (
    <Row className="placeholder-glow">
      <Col md={3} className="d-none d-md-block mb-3">
        {Array.from({ length: NAV_LINK_COUNT }).map((_, index) => (
          <Skeleton key={index} height={38} className="mb-2" />
        ))}
      </Col>

      <Col md={9}>
        {Array.from({ length: CARD_COUNT }).map((_, index) => (
          <Card className="mb-3" key={index}>
            <CardBody>
              <Skeleton width="30%" height={16} className="mb-3" />
              <Skeleton height={14} className="mb-2" />
              <Skeleton width="80%" height={14} />
            </CardBody>
          </Card>
        ))}
      </Col>
    </Row>
  );
}
