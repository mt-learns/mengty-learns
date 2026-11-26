import { FlowServer } from '@/components/flow/FlowServer';
import { K8S_REQUEST_FLOW } from '@/lib/flows/k8s-request';

/**
 * The Kubernetes request flow from content/docs/kubernetes/service-routing.mdx,
 * shown on the landing page.
 */
export function K8sRequestFlow() {
  return <FlowServer {...K8S_REQUEST_FLOW} />;
}
