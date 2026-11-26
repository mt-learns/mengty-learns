import { FlowServer } from '@/components/flow/FlowServer';

/**
 * The Kubernetes request flow from content/docs/kubernetes/service-routing.mdx,
 * shown on the landing page. Keep the two in sync; see BLOCKERS.md (landing B).
 */
export function K8sRequestFlow() {
  return (
    <FlowServer
      id="k8s-request"
      title="Kubernetes Request: User → Ingress → Service → Pod"
      nodes={[
        { id: 'user', label: 'User', subtitle: 'Browser', icon: 'user', category: 'client', rank: 0, order: 0 },
        { id: 'ing', label: 'Ingress', subtitle: 'L7 HTTP router', icon: 'gateway', category: 'edge', rank: 1, order: 0 },
        { id: 'svc', label: 'Service', subtitle: 'ClusterIP :80', icon: 'service', category: 'service', rank: 2, order: 0 },
        { id: 'podA', label: 'Pod A', subtitle: 'Ready', icon: 'pod', category: 'data', rank: 3, order: 0 },
        { id: 'podB', label: 'Pod B', subtitle: 'Ready', icon: 'pod', category: 'data', rank: 3, order: 1 },
      ]}
      steps={[
        { edge: 'user->ing', title: 'Browser requests /cart', text: 'Browser sends HTTPS GET /cart to the cluster Ingress controller' },
        { edge: 'ing->svc', title: 'Ingress routes to Service', text: 'Ingress matches host + path rule and forwards to Service "web" on port 80' },
        { edge: 'svc->podA', title: 'kube-proxy picks Pod A', text: 'kube-proxy picks a healthy Pod endpoint (Pod A) from EndpointSlice' },
        { edge: 'podA->svc', title: 'Pod A returns 200 OK', text: 'Pod A processes /cart and responds 200 OK', kind: 'response' },
        { edge: 'svc->ing', title: 'Service forwards response', text: 'Service returns the 200 OK response to the Ingress controller', kind: 'response' },
        { edge: 'ing->user', title: 'Ingress replies to browser', text: 'Ingress sends the HTTPS response back to the user browser', kind: 'response' },
      ]}
    />
  );
}
