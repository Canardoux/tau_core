# The Flutter tooling requires that developers have CMake 3.10 or later
# installed. You should not increase this version, as doing so will cause
# the plugin to fail to compile for some customers of the plugin.
cmake_minimum_required(VERSION 3.10)

project(tau_core_library VERSION 0.0.1 LANGUAGES C)

add_library(tau_core SHARED
  "tau_core.c"
)

set_target_properties(tau_core PROPERTIES
  PUBLIC_HEADER tau_core.h
  OUTPUT_NAME "tau_core"
)

target_compile_definitions(tau_core PUBLIC DART_SHARED_LIB)
