output "pet_slug" {
  description = "Randomly generated pet identifier."
  value       = random_pet.slug.id
}

output "manifest_path" {
  description = "Path to the generated JSON manifest."
  value       = local_file.manifest.filename
}
