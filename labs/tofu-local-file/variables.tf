variable "project_name" {
  description = "Project identifier written into the generated manifest."
  type        = string
  default     = "mengty-learns"
}

variable "environment" {
  description = "Target environment label."
  type        = string
  default     = "lab"
}

variable "output_dir" {
  description = "Directory where the generated file is written."
  type        = string
  default     = "./generated"
}
