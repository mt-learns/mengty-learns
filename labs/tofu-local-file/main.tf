resource "random_pet" "slug" {
  length    = 2
  separator = "-"
}

resource "local_file" "manifest" {
  filename = "${var.output_dir}/${var.project_name}-${var.environment}.json"
  content = jsonencode({
    project     = var.project_name
    environment = var.environment
    pet_slug    = random_pet.slug.id
  })
  file_permission = "0644"
}
