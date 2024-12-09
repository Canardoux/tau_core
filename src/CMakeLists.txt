# The Flutter tooling requires that developers have CMake 3.10 or later
# installed. You should not increase this version, as doing so will cause
# the plugin to fail to compile for some customers of the plugin.
cmake_minimum_required(VERSION 3.10)

project(tau_core_library VERSION 0.0.1 LANGUAGES C)

add_library(tau_core SHARED
  "tau_core.c"
    
  webaudio/analyser_handler.cc
  webaudio/analyser_node.cc
  webaudio/async_audio_decoder.cc

)

set_target_properties(tau_core PROPERTIES
  PUBLIC_HEADER tau_core.h
  OUTPUT_NAME "tau_core"
)

target_compile_definitions(tau_core PUBLIC DART_SHARED_LIB)
target_include_directories(tau_core PRIVATE /home/larpoux/projlin/tau/tau_core/src/chomium /home/larpoux/projlin/tau/tau_core/src/chromium/gen
   /home/larpoux/projlin/tau/tau_core/src/chromium/base/allocator/partition_allocator/src
   /home/larpoux/projlin/tau/tau_core/src/chromium/gen/base/allocator/partition_allocator/src)
include_directories(/home/larpoux/projlin/tau/tau_core/src/chromium /home/larpoux/projlin/tau/tau_core/src/chromium/gen
   /home/larpoux/projlin/tau/tau_core/src/chromium/base/allocator/partition_allocator/src
   /home/larpoux/projlin/tau/tau_core/src/chromium/gen/base/allocator/partition_allocator/src)
