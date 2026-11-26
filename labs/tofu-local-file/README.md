# Lab: First OpenTofu Project (Local & Random Providers)

## What You Build

A self-contained OpenTofu configuration that requires **no cloud credentials**:

- `versions.tf` — pins OpenTofu `>= 1.8.0` and the `hashicorp/local` and `hashicorp/random` providers.
- `variables.tf` — defines `project_name`, `environment`, and `output_dir`.
- `main.tf` — generates a `random_pet` slug and writes a JSON manifest using `local_file`.
- `outputs.tf` — prints the generated `pet_slug` and `manifest_path`.

## Prerequisites

- OpenTofu `1.8+` (or Terraform `1.8+`)

## Steps

1. Initialize providers and modules:

   ```bash
   cd labs/tofu-local-file
   tofu init
   ```

2. Preview the execution plan:

   ```bash
   tofu plan
   ```

3. Apply the plan (or override a variable):

   ```bash
   tofu apply -auto-approve -var="environment=dev"
   ```

4. Inspect the outputs and generated file:

   ```bash
   tofu output
   cat generated/mengty-learns-dev.json
   ```

## Expected Output

- `tofu plan` shows `Plan: 2 to add, 0 to change, 0 to destroy.`
- `tofu apply` creates `generated/mengty-learns-dev.json` containing `project`, `environment`, and `pet_slug`.

## Cleanup

```bash
tofu destroy -auto-approve -var="environment=dev"
```
