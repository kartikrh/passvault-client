"use client";

import { useEffect } from "react";
import { Card, CardBody, Container } from "reactstrap";
import DOMPurify from "dompurify";

import { usePages } from "@/lib/usePages";
import { resolvePageFromAlias } from "@/utils/navigation";
import { CMS_COMPONENT_REGISTRY } from "./cmsComponentRegistry";
import SiteNav from "./SiteNav";

// Shared by both the root route (src/app/page.js, alias "home") and the
// catch-all route (src/app/[...slug]/page.js) so "/" and "/home" always
// render the same resolved page instead of two copies of this logic.
export default function CmsPageView({ slug }) {
  const { pages, isLoading } = usePages();
  const pageData = resolvePageFromAlias(pages, slug);

  useEffect(() => {
    if (pageData) {
      document.title = pageData.seoWord || pageData.pageTitle || pageData.pageHeading || "PassVault";
    }
  }, [pageData]);

  if (isLoading) {
    return (
      <>
        <SiteNav pages={pages} />
        <Container className="py-5">
          <p className="text-center text-muted">Loading...</p>
        </Container>
      </>
    );
  }

  if (!pageData) {
    return (
      <>
        <SiteNav pages={pages} />
        <Container className="py-5">
          <Card className="mx-auto" style={{ maxWidth: 480 }}>
            <CardBody className="p-4 text-center">
              <i className="bx bx-error-circle text-danger" style={{ fontSize: "2.5rem" }} />
              <h4 className="mt-3">Page Not Found</h4>
              <p className="text-muted">The requested page could not be found.</p>
            </CardBody>
          </Card>
        </Container>
      </>
    );
  }

  if (pageData.isLink) {
    const Component = CMS_COMPONENT_REGISTRY[pageData.linkURL];
    return (
      <>
        <SiteNav pages={pages} />
        {Component ? (
          <Component page={pageData} />
        ) : (
          <Container className="py-5 text-center">
            <h4>{pageData.pageHeading}</h4>
            <p className="text-muted">This page is coming soon.</p>
          </Container>
        )}
      </>
    );
  }

  const sanitizedContent = pageData.pageContent ? DOMPurify.sanitize(pageData.pageContent) : "";

  return (
    <>
      <SiteNav pages={pages} />
      <Container className="py-5">
        <Card className="mx-auto" style={{ maxWidth: 900 }}>
          <CardBody className="p-4">
            {pageData.pageHeading && <h4 className="mb-3">{pageData.pageHeading}</h4>}
            {sanitizedContent && <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />}
          </CardBody>
        </Card>
      </Container>
    </>
  );
}
