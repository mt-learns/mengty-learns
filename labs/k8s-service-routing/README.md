# Lab: Kubernetes Service Routing (Ingress -> Service -> Pod)

## What You Build

Three Kubernetes manifests matching the Service Routing note:

- `k8s/deployment.yaml` — a 2-replica `web` Deployment (`app: web`) listening on port `8080` with readiness/liveness probes and CPU/memory requests & limits.
- `k8s/service.yaml` — a `ClusterIP` Service (`web`) mapping port `80` to `targetPort: 8080`.
- `k8s/ingress.yaml` — an Ingress (`web-ingress`) routing `shop.example.com/cart` to `web:80`.

## Prerequisites

- `kubectl` 1.30+
- A local cluster (`kind` or `minikube`) with an Ingress controller (for example `ingress-nginx`)

## Steps

1. Apply all manifests in `k8s/`:

   ```bash
   kubectl apply -f labs/k8s-service-routing/k8s/
   ```

2. Wait for both replicas to become Ready and inspect the EndpointSlice:

   ```bash
   kubectl rollout status deployment/web
   kubectl get pods -l app=web
   kubectl get endpointslices -l kubernetes.io/service-name=web
   kubectl describe ingress web-ingress
   ```

3. Test routing through the Ingress controller (port-forward if running locally):

   ```bash
   curl -H "Host: shop.example.com" http://localhost/cart
   ```

## Expected Output

- `kubectl get pods -l app=web` shows 2 Pods in `Running` state (`1/1` Ready).
- `kubectl get endpointslices -l kubernetes.io/service-name=web` lists two ready Pod IPs on port `8080`.
- `curl -H "Host: shop.example.com" http://localhost/cart` returns `ok`.

## Cleanup

```bash
kubectl delete -f labs/k8s-service-routing/k8s/
```
