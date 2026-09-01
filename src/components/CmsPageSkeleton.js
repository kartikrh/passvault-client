"use client";

import { Card, CardBody, Container } from "reactstrap";
import Skeleton from "@/components/Skeleton";

const LINE_COUNT = 6;

// Shown by CmsPageView while usePages' initial fetch is in flight for any
// non-home CMS page (About Us, Privacy Policy, News, ...) -- shaped like
// the plain heading + rich-text card those pages render into.
export default function CmsPageSkeleton() {
  return (
    <Container className="py-5">
      <Card className="mx-auto placeholder-glow" style={{ maxWidth: 900 }}>
        <CardBody className="p-4">
          <Skeleton height={24} width="40%" className="mb-4" />
          {Array.from({ length: LINE_COUNT }).map((_, index) => (
            <Skeleton
              key={index}
              height={14}
              width={index === LINE_COUNT - 1 ? "60%" : "100%"}
              className="mb-2"
            />
          ))}
        </CardBody>
      </Card>
    </Container>
  );
}
