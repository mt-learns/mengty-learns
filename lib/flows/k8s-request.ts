import type { FlowProps } from '@/components/diagram/types';

export const K8S_REQUEST_FLOW: FlowProps = {
  id: 'k8s-request',
  title: 'Kubernetes Request: User → Ingress → Service → Pod',
  nodes: [
    { id: 'user', label: 'User', subtitle: 'Browser', icon: 'user', category: 'client', rank: 0, order: 0 },
    { id: 'ing', label: 'Ingress', subtitle: 'L7 HTTP router', icon: 'gateway', category: 'edge', rank: 1, order: 0 },
    { id: 'svc', label: 'Service', subtitle: 'Virtual ClusterIP :80', icon: 'service', category: 'service', rank: 2, order: 0 },
    { id: 'podA', label: 'Pod A', subtitle: 'Ready', icon: 'pod', category: 'data', rank: 3, order: 0 },
    { id: 'podB', label: 'Pod B', subtitle: 'Ready', icon: 'pod', category: 'data', rank: 3, order: 1 },
  ],
  steps: [
    { edge: 'user->ing', title: 'Browser requests /cart', text: 'Browser sends HTTPS GET /cart to the cluster Ingress controller' },
    { edge: 'ing->svc', title: 'Ingress targets Service VIP', text: 'Ingress matches host + path and sends TCP traffic to Service "web" virtual ClusterIP :80' },
    { edge: 'svc->podA', title: 'kube-proxy DNAT to Pod A', text: 'Service is a virtual IP (not an L7 proxy); kube-proxy DNAT/conntrack rewrites dst to Pod A' },
    { edge: 'podA->svc', title: 'Pod A returns 200 OK', text: 'Pod A responds 200 OK; kernel conntrack reverses DNAT back to the Service VIP', kind: 'response' },
    { edge: 'svc->ing', title: 'Conntrack replies to Ingress', text: 'Conntrack restores the ClusterIP source and delivers 200 OK to Ingress', kind: 'response' },
    { edge: 'ing->user', title: 'Ingress replies to browser', text: 'Ingress sends the HTTPS response back to the user browser', kind: 'response' },
  ],
};
