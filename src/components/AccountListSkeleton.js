"use client";

import Skeleton from "@/components/Skeleton";

const ROW_COUNT = 4;

// Shown in place of VaultAccountList while useVault's initial GET
// /vault/data + decrypt is in flight -- shaped like the real table (search
// input, Name/Tags/Actions columns) so the layout doesn't jump once real
// rows replace it.
export default function AccountListSkeleton() {
  return (
    <div className="placeholder-glow">
      <Skeleton height={38} className="mb-3" />

      <table className="table align-middle mb-0">
        <thead>
          <tr className="text-muted small">
            <th>Name</th>
            <th>Tags</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROW_COUNT }).map((_, index) => (
            <tr key={index}>
              <td>
                <Skeleton width="60%" />
              </td>
              <td>
                <Skeleton width="35%" />
              </td>
              <td className="text-end">
                <Skeleton width={70} height={30} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
