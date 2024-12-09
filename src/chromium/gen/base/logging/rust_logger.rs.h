#pragma once

namespace logging {
namespace internal {
__attribute__((visibility("default"))) void init_rust_log_crate() noexcept;
} // namespace internal
} // namespace logging
