#ifndef SRC_TRACE_PROCESSOR_TABLES_ETM_TABLES_PY_H_
#define SRC_TRACE_PROCESSOR_TABLES_ETM_TABLES_PY_H_

#include <array>
#include <cstddef>
#include <cstdint>
#include <memory>
#include <optional>
#include <type_traits>
#include <utility>
#include <vector>

#include "perfetto/base/logging.h"
#include "perfetto/trace_processor/basic_types.h"
#include "perfetto/trace_processor/ref_counted.h"
#include "src/trace_processor/containers/bit_vector.h"
#include "src/trace_processor/containers/row_map.h"
#include "src/trace_processor/containers/string_pool.h"
#include "src/trace_processor/db/column/arrangement_overlay.h"
#include "src/trace_processor/db/column/data_layer.h"
#include "src/trace_processor/db/column/dense_null_overlay.h"
#include "src/trace_processor/db/column/numeric_storage.h"
#include "src/trace_processor/db/column/id_storage.h"
#include "src/trace_processor/db/column/null_overlay.h"
#include "src/trace_processor/db/column/range_overlay.h"
#include "src/trace_processor/db/column/selector_overlay.h"
#include "src/trace_processor/db/column/set_id_storage.h"
#include "src/trace_processor/db/column/string_storage.h"
#include "src/trace_processor/db/column/types.h"
#include "src/trace_processor/db/column_storage.h"
#include "src/trace_processor/db/column.h"
#include "src/trace_processor/db/table.h"
#include "src/trace_processor/db/typed_column.h"
#include "src/trace_processor/db/typed_column_internal.h"
#include "src/trace_processor/tables/macros_internal.h"



namespace perfetto::trace_processor::tables {

class EtmV4ConfigurationTable : public macros_internal::MacroTable {
 public:
  static constexpr uint32_t kColumnCount = 11;

  struct Id : public BaseId {
    Id() = default;
    explicit constexpr Id(uint32_t v) : BaseId(v) {}
  };
  static_assert(std::is_trivially_destructible_v<Id>,
                "Inheritance used without trivial destruction");
    
  struct ColumnIndex {
    static constexpr uint32_t id = 0;
    static constexpr uint32_t type = 1;
    static constexpr uint32_t set_id = 2;
    static constexpr uint32_t cpu = 3;
    static constexpr uint32_t cs_trace_id = 4;
    static constexpr uint32_t core_profile = 5;
    static constexpr uint32_t arch_version = 6;
    static constexpr uint32_t major_version = 7;
    static constexpr uint32_t minor_version = 8;
    static constexpr uint32_t max_speculation_depth = 9;
    static constexpr uint32_t bool_flags = 10;
  };
  struct ColumnType {
    using id = IdColumn<EtmV4ConfigurationTable::Id>;
    using type = TypedColumn<StringPool::Id>;
    using set_id = TypedColumn<uint32_t>;
    using cpu = TypedColumn<uint32_t>;
    using cs_trace_id = TypedColumn<uint32_t>;
    using core_profile = TypedColumn<StringPool::Id>;
    using arch_version = TypedColumn<StringPool::Id>;
    using major_version = TypedColumn<uint32_t>;
    using minor_version = TypedColumn<uint32_t>;
    using max_speculation_depth = TypedColumn<uint32_t>;
    using bool_flags = TypedColumn<int64_t>;
  };
  struct Row : public macros_internal::RootParentTable::Row {
    Row(uint32_t in_set_id = {},
        uint32_t in_cpu = {},
        uint32_t in_cs_trace_id = {},
        StringPool::Id in_core_profile = {},
        StringPool::Id in_arch_version = {},
        uint32_t in_major_version = {},
        uint32_t in_minor_version = {},
        uint32_t in_max_speculation_depth = {},
        int64_t in_bool_flags = {},
        std::nullptr_t = nullptr)
        : macros_internal::RootParentTable::Row(),
          set_id(in_set_id),
          cpu(in_cpu),
          cs_trace_id(in_cs_trace_id),
          core_profile(in_core_profile),
          arch_version(in_arch_version),
          major_version(in_major_version),
          minor_version(in_minor_version),
          max_speculation_depth(in_max_speculation_depth),
          bool_flags(in_bool_flags) {
      type_ = "__intrinsic_etm_v4_configuration";
    }
    uint32_t set_id;
    uint32_t cpu;
    uint32_t cs_trace_id;
    StringPool::Id core_profile;
    StringPool::Id arch_version;
    uint32_t major_version;
    uint32_t minor_version;
    uint32_t max_speculation_depth;
    int64_t bool_flags;

    bool operator==(const EtmV4ConfigurationTable::Row& other) const {
      return type() == other.type() && ColumnType::set_id::Equals(set_id, other.set_id) &&
       ColumnType::cpu::Equals(cpu, other.cpu) &&
       ColumnType::cs_trace_id::Equals(cs_trace_id, other.cs_trace_id) &&
       ColumnType::core_profile::Equals(core_profile, other.core_profile) &&
       ColumnType::arch_version::Equals(arch_version, other.arch_version) &&
       ColumnType::major_version::Equals(major_version, other.major_version) &&
       ColumnType::minor_version::Equals(minor_version, other.minor_version) &&
       ColumnType::max_speculation_depth::Equals(max_speculation_depth, other.max_speculation_depth) &&
       ColumnType::bool_flags::Equals(bool_flags, other.bool_flags);
    }
  };
  struct ColumnFlag {
    static constexpr uint32_t set_id = static_cast<uint32_t>(ColumnLegacy::Flag::kSorted | ColumnLegacy::Flag::kSetId) | ColumnType::set_id::default_flags();
    static constexpr uint32_t cpu = ColumnType::cpu::default_flags();
    static constexpr uint32_t cs_trace_id = ColumnType::cs_trace_id::default_flags();
    static constexpr uint32_t core_profile = ColumnType::core_profile::default_flags();
    static constexpr uint32_t arch_version = ColumnType::arch_version::default_flags();
    static constexpr uint32_t major_version = ColumnType::major_version::default_flags();
    static constexpr uint32_t minor_version = ColumnType::minor_version::default_flags();
    static constexpr uint32_t max_speculation_depth = ColumnType::max_speculation_depth::default_flags();
    static constexpr uint32_t bool_flags = ColumnType::bool_flags::default_flags();
  };

  class RowNumber;
  class ConstRowReference;
  class RowReference;

  class RowNumber : public macros_internal::AbstractRowNumber<
      EtmV4ConfigurationTable, ConstRowReference, RowReference> {
   public:
    explicit RowNumber(uint32_t row_number)
        : AbstractRowNumber(row_number) {}
  };
  static_assert(std::is_trivially_destructible_v<RowNumber>,
                "Inheritance used without trivial destruction");

  class ConstRowReference : public macros_internal::AbstractConstRowReference<
    EtmV4ConfigurationTable, RowNumber> {
   public:
    ConstRowReference(const EtmV4ConfigurationTable* table, uint32_t row_number)
        : AbstractConstRowReference(table, row_number) {}

    ColumnType::id::type id() const {
      return table()->id()[row_number_];
    }
    ColumnType::type::type type() const {
      return table()->type()[row_number_];
    }
    ColumnType::set_id::type set_id() const {
      return table()->set_id()[row_number_];
    }
    ColumnType::cpu::type cpu() const {
      return table()->cpu()[row_number_];
    }
    ColumnType::cs_trace_id::type cs_trace_id() const {
      return table()->cs_trace_id()[row_number_];
    }
    ColumnType::core_profile::type core_profile() const {
      return table()->core_profile()[row_number_];
    }
    ColumnType::arch_version::type arch_version() const {
      return table()->arch_version()[row_number_];
    }
    ColumnType::major_version::type major_version() const {
      return table()->major_version()[row_number_];
    }
    ColumnType::minor_version::type minor_version() const {
      return table()->minor_version()[row_number_];
    }
    ColumnType::max_speculation_depth::type max_speculation_depth() const {
      return table()->max_speculation_depth()[row_number_];
    }
    ColumnType::bool_flags::type bool_flags() const {
      return table()->bool_flags()[row_number_];
    }
  };
  static_assert(std::is_trivially_destructible_v<ConstRowReference>,
                "Inheritance used without trivial destruction");
  class RowReference : public ConstRowReference {
   public:
    RowReference(const EtmV4ConfigurationTable* table, uint32_t row_number)
        : ConstRowReference(table, row_number) {}

    void set_set_id(
        ColumnType::set_id::non_optional_type v) {
      return mutable_table()->mutable_set_id()->Set(row_number_, v);
    }
    void set_cpu(
        ColumnType::cpu::non_optional_type v) {
      return mutable_table()->mutable_cpu()->Set(row_number_, v);
    }
    void set_cs_trace_id(
        ColumnType::cs_trace_id::non_optional_type v) {
      return mutable_table()->mutable_cs_trace_id()->Set(row_number_, v);
    }
    void set_core_profile(
        ColumnType::core_profile::non_optional_type v) {
      return mutable_table()->mutable_core_profile()->Set(row_number_, v);
    }
    void set_arch_version(
        ColumnType::arch_version::non_optional_type v) {
      return mutable_table()->mutable_arch_version()->Set(row_number_, v);
    }
    void set_major_version(
        ColumnType::major_version::non_optional_type v) {
      return mutable_table()->mutable_major_version()->Set(row_number_, v);
    }
    void set_minor_version(
        ColumnType::minor_version::non_optional_type v) {
      return mutable_table()->mutable_minor_version()->Set(row_number_, v);
    }
    void set_max_speculation_depth(
        ColumnType::max_speculation_depth::non_optional_type v) {
      return mutable_table()->mutable_max_speculation_depth()->Set(row_number_, v);
    }
    void set_bool_flags(
        ColumnType::bool_flags::non_optional_type v) {
      return mutable_table()->mutable_bool_flags()->Set(row_number_, v);
    }

   private:
    EtmV4ConfigurationTable* mutable_table() const {
      return const_cast<EtmV4ConfigurationTable*>(table());
    }
  };
  static_assert(std::is_trivially_destructible_v<RowReference>,
                "Inheritance used without trivial destruction");

  class ConstIterator;
  class ConstIterator : public macros_internal::AbstractConstIterator<
    ConstIterator, EtmV4ConfigurationTable, RowNumber, ConstRowReference> {
   public:
    ColumnType::id::type id() const {
      const auto& col = table()->id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::type::type type() const {
      const auto& col = table()->type();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::set_id::type set_id() const {
      const auto& col = table()->set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::cpu::type cpu() const {
      const auto& col = table()->cpu();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::cs_trace_id::type cs_trace_id() const {
      const auto& col = table()->cs_trace_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::core_profile::type core_profile() const {
      const auto& col = table()->core_profile();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::arch_version::type arch_version() const {
      const auto& col = table()->arch_version();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::major_version::type major_version() const {
      const auto& col = table()->major_version();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::minor_version::type minor_version() const {
      const auto& col = table()->minor_version();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::max_speculation_depth::type max_speculation_depth() const {
      const auto& col = table()->max_speculation_depth();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::bool_flags::type bool_flags() const {
      const auto& col = table()->bool_flags();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }

   protected:
    explicit ConstIterator(const EtmV4ConfigurationTable* table,
                           Table::Iterator iterator)
        : AbstractConstIterator(table, std::move(iterator)) {}

    uint32_t CurrentRowNumber() const {
      return iterator_.StorageIndexForLastOverlay();
    }

   private:
    friend class EtmV4ConfigurationTable;
    friend class macros_internal::AbstractConstIterator<
      ConstIterator, EtmV4ConfigurationTable, RowNumber, ConstRowReference>;
  };
  class Iterator : public ConstIterator {
    public:
     RowReference row_reference() const {
       return {const_cast<EtmV4ConfigurationTable*>(table()), CurrentRowNumber()};
     }

    private:
     friend class EtmV4ConfigurationTable;

     explicit Iterator(EtmV4ConfigurationTable* table, Table::Iterator iterator)
        : ConstIterator(table, std::move(iterator)) {}
  };

  struct IdAndRow {
    Id id;
    uint32_t row;
    RowReference row_reference;
    RowNumber row_number;
  };

  static std::vector<ColumnLegacy> GetColumns(
      EtmV4ConfigurationTable* self,
      const macros_internal::MacroTable* parent) {
    std::vector<ColumnLegacy> columns =
        CopyColumnsFromParentOrAddRootColumns(self, parent);
    uint32_t olay_idx = OverlayCount(parent);
    AddColumnToVector(columns, "set_id", &self->set_id_, ColumnFlag::set_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "cpu", &self->cpu_, ColumnFlag::cpu,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "cs_trace_id", &self->cs_trace_id_, ColumnFlag::cs_trace_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "core_profile", &self->core_profile_, ColumnFlag::core_profile,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "arch_version", &self->arch_version_, ColumnFlag::arch_version,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "major_version", &self->major_version_, ColumnFlag::major_version,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "minor_version", &self->minor_version_, ColumnFlag::minor_version,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "max_speculation_depth", &self->max_speculation_depth_, ColumnFlag::max_speculation_depth,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "bool_flags", &self->bool_flags_, ColumnFlag::bool_flags,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    return columns;
  }

  PERFETTO_NO_INLINE explicit EtmV4ConfigurationTable(StringPool* pool)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, nullptr),
          nullptr),
        set_id_(ColumnStorage<ColumnType::set_id::stored_type>::Create<false>()),
        cpu_(ColumnStorage<ColumnType::cpu::stored_type>::Create<false>()),
        cs_trace_id_(ColumnStorage<ColumnType::cs_trace_id::stored_type>::Create<false>()),
        core_profile_(ColumnStorage<ColumnType::core_profile::stored_type>::Create<false>()),
        arch_version_(ColumnStorage<ColumnType::arch_version::stored_type>::Create<false>()),
        major_version_(ColumnStorage<ColumnType::major_version::stored_type>::Create<false>()),
        minor_version_(ColumnStorage<ColumnType::minor_version::stored_type>::Create<false>()),
        max_speculation_depth_(ColumnStorage<ColumnType::max_speculation_depth::stored_type>::Create<false>()),
        bool_flags_(ColumnStorage<ColumnType::bool_flags::stored_type>::Create<false>())
,
        id_storage_layer_(new column::IdStorage()),
        type_storage_layer_(
          new column::StringStorage(string_pool(), &type_.vector())),
        set_id_storage_layer_(
          new column::SetIdStorage(&set_id_.vector())),
        cpu_storage_layer_(
        new column::NumericStorage<ColumnType::cpu::non_optional_stored_type>(
          &cpu_.vector(),
          ColumnTypeHelper<ColumnType::cpu::stored_type>::ToColumnType(),
          false)),
        cs_trace_id_storage_layer_(
        new column::NumericStorage<ColumnType::cs_trace_id::non_optional_stored_type>(
          &cs_trace_id_.vector(),
          ColumnTypeHelper<ColumnType::cs_trace_id::stored_type>::ToColumnType(),
          false)),
        core_profile_storage_layer_(
          new column::StringStorage(string_pool(), &core_profile_.vector())),
        arch_version_storage_layer_(
          new column::StringStorage(string_pool(), &arch_version_.vector())),
        major_version_storage_layer_(
        new column::NumericStorage<ColumnType::major_version::non_optional_stored_type>(
          &major_version_.vector(),
          ColumnTypeHelper<ColumnType::major_version::stored_type>::ToColumnType(),
          false)),
        minor_version_storage_layer_(
        new column::NumericStorage<ColumnType::minor_version::non_optional_stored_type>(
          &minor_version_.vector(),
          ColumnTypeHelper<ColumnType::minor_version::stored_type>::ToColumnType(),
          false)),
        max_speculation_depth_storage_layer_(
        new column::NumericStorage<ColumnType::max_speculation_depth::non_optional_stored_type>(
          &max_speculation_depth_.vector(),
          ColumnTypeHelper<ColumnType::max_speculation_depth::stored_type>::ToColumnType(),
          false)),
        bool_flags_storage_layer_(
        new column::NumericStorage<ColumnType::bool_flags::non_optional_stored_type>(
          &bool_flags_.vector(),
          ColumnTypeHelper<ColumnType::bool_flags::stored_type>::ToColumnType(),
          false))
         {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::set_id::stored_type>(
          ColumnFlag::set_id),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::cpu::stored_type>(
          ColumnFlag::cpu),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::cs_trace_id::stored_type>(
          ColumnFlag::cs_trace_id),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::core_profile::stored_type>(
          ColumnFlag::core_profile),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::arch_version::stored_type>(
          ColumnFlag::arch_version),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::major_version::stored_type>(
          ColumnFlag::major_version),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::minor_version::stored_type>(
          ColumnFlag::minor_version),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::max_speculation_depth::stored_type>(
          ColumnFlag::max_speculation_depth),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::bool_flags::stored_type>(
          ColumnFlag::bool_flags),
        "Column type and flag combination is not valid");
    OnConstructionCompletedRegularConstructor(
      {id_storage_layer_,type_storage_layer_,set_id_storage_layer_,cpu_storage_layer_,cs_trace_id_storage_layer_,core_profile_storage_layer_,arch_version_storage_layer_,major_version_storage_layer_,minor_version_storage_layer_,max_speculation_depth_storage_layer_,bool_flags_storage_layer_},
      {{},{},{},{},{},{},{},{},{},{},{}});
  }
  ~EtmV4ConfigurationTable() override;

  static const char* Name() { return "__intrinsic_etm_v4_configuration"; }

  static Table::Schema ComputeStaticSchema() {
    Table::Schema schema;
    schema.columns.emplace_back(Table::Schema::Column{
        "id", SqlValue::Type::kLong, true, true, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "type", SqlValue::Type::kString, false, false, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "set_id", ColumnType::set_id::SqlValueType(), false,
        true,
        false,
        true});
    schema.columns.emplace_back(Table::Schema::Column{
        "cpu", ColumnType::cpu::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "cs_trace_id", ColumnType::cs_trace_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "core_profile", ColumnType::core_profile::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "arch_version", ColumnType::arch_version::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "major_version", ColumnType::major_version::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "minor_version", ColumnType::minor_version::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "max_speculation_depth", ColumnType::max_speculation_depth::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "bool_flags", ColumnType::bool_flags::SqlValueType(), false,
        false,
        false,
        false});
    return schema;
  }

  ConstIterator IterateRows() const {
    return ConstIterator(this, Table::IterateRows());
  }

  Iterator IterateRows() { return Iterator(this, Table::IterateRows()); }

  ConstIterator FilterToIterator(const Query& q) const {
    return ConstIterator(this, QueryToIterator(q));
  }

  Iterator FilterToIterator(const Query& q) {
    return Iterator(this, QueryToIterator(q));
  }

  void ShrinkToFit() {
    type_.ShrinkToFit();
    set_id_.ShrinkToFit();
    cpu_.ShrinkToFit();
    cs_trace_id_.ShrinkToFit();
    core_profile_.ShrinkToFit();
    arch_version_.ShrinkToFit();
    major_version_.ShrinkToFit();
    minor_version_.ShrinkToFit();
    max_speculation_depth_.ShrinkToFit();
    bool_flags_.ShrinkToFit();
  }

  ConstRowReference operator[](uint32_t r) const {
    return ConstRowReference(this, r);
  }
  RowReference operator[](uint32_t r) { return RowReference(this, r); }
  ConstRowReference operator[](RowNumber r) const {
    return ConstRowReference(this, r.row_number());
  }
  RowReference operator[](RowNumber r) {
    return RowReference(this, r.row_number());
  }

  std::optional<ConstRowReference> FindById(Id find_id) const {
    std::optional<uint32_t> row = id().IndexOf(find_id);
    return row ? std::make_optional(ConstRowReference(this, *row))
               : std::nullopt;
  }

  std::optional<RowReference> FindById(Id find_id) {
    std::optional<uint32_t> row = id().IndexOf(find_id);
    return row ? std::make_optional(RowReference(this, *row)) : std::nullopt;
  }

  IdAndRow Insert(const Row& row) {
    uint32_t row_number = row_count();
    Id id = Id{row_number};
    type_.Append(string_pool()->InternString(row.type()));
    mutable_set_id()->Append(row.set_id);
    mutable_cpu()->Append(row.cpu);
    mutable_cs_trace_id()->Append(row.cs_trace_id);
    mutable_core_profile()->Append(row.core_profile);
    mutable_arch_version()->Append(row.arch_version);
    mutable_major_version()->Append(row.major_version);
    mutable_minor_version()->Append(row.minor_version);
    mutable_max_speculation_depth()->Append(row.max_speculation_depth);
    mutable_bool_flags()->Append(row.bool_flags);
    UpdateSelfOverlayAfterInsert();
    return IdAndRow{id, row_number, RowReference(this, row_number),
                     RowNumber(row_number)};
  }

  

  const IdColumn<EtmV4ConfigurationTable::Id>& id() const {
    return static_cast<const ColumnType::id&>(columns()[ColumnIndex::id]);
  }
  const TypedColumn<StringPool::Id>& type() const {
    return static_cast<const ColumnType::type&>(columns()[ColumnIndex::type]);
  }
  const TypedColumn<uint32_t>& set_id() const {
    return static_cast<const ColumnType::set_id&>(columns()[ColumnIndex::set_id]);
  }
  const TypedColumn<uint32_t>& cpu() const {
    return static_cast<const ColumnType::cpu&>(columns()[ColumnIndex::cpu]);
  }
  const TypedColumn<uint32_t>& cs_trace_id() const {
    return static_cast<const ColumnType::cs_trace_id&>(columns()[ColumnIndex::cs_trace_id]);
  }
  const TypedColumn<StringPool::Id>& core_profile() const {
    return static_cast<const ColumnType::core_profile&>(columns()[ColumnIndex::core_profile]);
  }
  const TypedColumn<StringPool::Id>& arch_version() const {
    return static_cast<const ColumnType::arch_version&>(columns()[ColumnIndex::arch_version]);
  }
  const TypedColumn<uint32_t>& major_version() const {
    return static_cast<const ColumnType::major_version&>(columns()[ColumnIndex::major_version]);
  }
  const TypedColumn<uint32_t>& minor_version() const {
    return static_cast<const ColumnType::minor_version&>(columns()[ColumnIndex::minor_version]);
  }
  const TypedColumn<uint32_t>& max_speculation_depth() const {
    return static_cast<const ColumnType::max_speculation_depth&>(columns()[ColumnIndex::max_speculation_depth]);
  }
  const TypedColumn<int64_t>& bool_flags() const {
    return static_cast<const ColumnType::bool_flags&>(columns()[ColumnIndex::bool_flags]);
  }

  TypedColumn<uint32_t>* mutable_set_id() {
    return static_cast<ColumnType::set_id*>(
        GetColumn(ColumnIndex::set_id));
  }
  TypedColumn<uint32_t>* mutable_cpu() {
    return static_cast<ColumnType::cpu*>(
        GetColumn(ColumnIndex::cpu));
  }
  TypedColumn<uint32_t>* mutable_cs_trace_id() {
    return static_cast<ColumnType::cs_trace_id*>(
        GetColumn(ColumnIndex::cs_trace_id));
  }
  TypedColumn<StringPool::Id>* mutable_core_profile() {
    return static_cast<ColumnType::core_profile*>(
        GetColumn(ColumnIndex::core_profile));
  }
  TypedColumn<StringPool::Id>* mutable_arch_version() {
    return static_cast<ColumnType::arch_version*>(
        GetColumn(ColumnIndex::arch_version));
  }
  TypedColumn<uint32_t>* mutable_major_version() {
    return static_cast<ColumnType::major_version*>(
        GetColumn(ColumnIndex::major_version));
  }
  TypedColumn<uint32_t>* mutable_minor_version() {
    return static_cast<ColumnType::minor_version*>(
        GetColumn(ColumnIndex::minor_version));
  }
  TypedColumn<uint32_t>* mutable_max_speculation_depth() {
    return static_cast<ColumnType::max_speculation_depth*>(
        GetColumn(ColumnIndex::max_speculation_depth));
  }
  TypedColumn<int64_t>* mutable_bool_flags() {
    return static_cast<ColumnType::bool_flags*>(
        GetColumn(ColumnIndex::bool_flags));
  }

 private:
  
  
  ColumnStorage<ColumnType::set_id::stored_type> set_id_;
  ColumnStorage<ColumnType::cpu::stored_type> cpu_;
  ColumnStorage<ColumnType::cs_trace_id::stored_type> cs_trace_id_;
  ColumnStorage<ColumnType::core_profile::stored_type> core_profile_;
  ColumnStorage<ColumnType::arch_version::stored_type> arch_version_;
  ColumnStorage<ColumnType::major_version::stored_type> major_version_;
  ColumnStorage<ColumnType::minor_version::stored_type> minor_version_;
  ColumnStorage<ColumnType::max_speculation_depth::stored_type> max_speculation_depth_;
  ColumnStorage<ColumnType::bool_flags::stored_type> bool_flags_;

  RefPtr<column::StorageLayer> id_storage_layer_;
  RefPtr<column::StorageLayer> type_storage_layer_;
  RefPtr<column::StorageLayer> set_id_storage_layer_;
  RefPtr<column::StorageLayer> cpu_storage_layer_;
  RefPtr<column::StorageLayer> cs_trace_id_storage_layer_;
  RefPtr<column::StorageLayer> core_profile_storage_layer_;
  RefPtr<column::StorageLayer> arch_version_storage_layer_;
  RefPtr<column::StorageLayer> major_version_storage_layer_;
  RefPtr<column::StorageLayer> minor_version_storage_layer_;
  RefPtr<column::StorageLayer> max_speculation_depth_storage_layer_;
  RefPtr<column::StorageLayer> bool_flags_storage_layer_;

  
};
  

class EtmV4SessionTable : public macros_internal::MacroTable {
 public:
  static constexpr uint32_t kColumnCount = 4;

  struct Id : public BaseId {
    Id() = default;
    explicit constexpr Id(uint32_t v) : BaseId(v) {}
  };
  static_assert(std::is_trivially_destructible_v<Id>,
                "Inheritance used without trivial destruction");
    
  struct ColumnIndex {
    static constexpr uint32_t id = 0;
    static constexpr uint32_t type = 1;
    static constexpr uint32_t configuration_id = 2;
    static constexpr uint32_t start_ts = 3;
  };
  struct ColumnType {
    using id = IdColumn<EtmV4SessionTable::Id>;
    using type = TypedColumn<StringPool::Id>;
    using configuration_id = TypedColumn<EtmV4ConfigurationTable::Id>;
    using start_ts = TypedColumn<std::optional<int64_t>>;
  };
  struct Row : public macros_internal::RootParentTable::Row {
    Row(EtmV4ConfigurationTable::Id in_configuration_id = {},
        std::optional<int64_t> in_start_ts = {},
        std::nullptr_t = nullptr)
        : macros_internal::RootParentTable::Row(),
          configuration_id(in_configuration_id),
          start_ts(in_start_ts) {
      type_ = "__intrinsic_etm_v4_session";
    }
    EtmV4ConfigurationTable::Id configuration_id;
    std::optional<int64_t> start_ts;

    bool operator==(const EtmV4SessionTable::Row& other) const {
      return type() == other.type() && ColumnType::configuration_id::Equals(configuration_id, other.configuration_id) &&
       ColumnType::start_ts::Equals(start_ts, other.start_ts);
    }
  };
  struct ColumnFlag {
    static constexpr uint32_t configuration_id = ColumnType::configuration_id::default_flags();
    static constexpr uint32_t start_ts = ColumnType::start_ts::default_flags();
  };

  class RowNumber;
  class ConstRowReference;
  class RowReference;

  class RowNumber : public macros_internal::AbstractRowNumber<
      EtmV4SessionTable, ConstRowReference, RowReference> {
   public:
    explicit RowNumber(uint32_t row_number)
        : AbstractRowNumber(row_number) {}
  };
  static_assert(std::is_trivially_destructible_v<RowNumber>,
                "Inheritance used without trivial destruction");

  class ConstRowReference : public macros_internal::AbstractConstRowReference<
    EtmV4SessionTable, RowNumber> {
   public:
    ConstRowReference(const EtmV4SessionTable* table, uint32_t row_number)
        : AbstractConstRowReference(table, row_number) {}

    ColumnType::id::type id() const {
      return table()->id()[row_number_];
    }
    ColumnType::type::type type() const {
      return table()->type()[row_number_];
    }
    ColumnType::configuration_id::type configuration_id() const {
      return table()->configuration_id()[row_number_];
    }
    ColumnType::start_ts::type start_ts() const {
      return table()->start_ts()[row_number_];
    }
  };
  static_assert(std::is_trivially_destructible_v<ConstRowReference>,
                "Inheritance used without trivial destruction");
  class RowReference : public ConstRowReference {
   public:
    RowReference(const EtmV4SessionTable* table, uint32_t row_number)
        : ConstRowReference(table, row_number) {}

    void set_configuration_id(
        ColumnType::configuration_id::non_optional_type v) {
      return mutable_table()->mutable_configuration_id()->Set(row_number_, v);
    }
    void set_start_ts(
        ColumnType::start_ts::non_optional_type v) {
      return mutable_table()->mutable_start_ts()->Set(row_number_, v);
    }

   private:
    EtmV4SessionTable* mutable_table() const {
      return const_cast<EtmV4SessionTable*>(table());
    }
  };
  static_assert(std::is_trivially_destructible_v<RowReference>,
                "Inheritance used without trivial destruction");

  class ConstIterator;
  class ConstIterator : public macros_internal::AbstractConstIterator<
    ConstIterator, EtmV4SessionTable, RowNumber, ConstRowReference> {
   public:
    ColumnType::id::type id() const {
      const auto& col = table()->id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::type::type type() const {
      const auto& col = table()->type();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::configuration_id::type configuration_id() const {
      const auto& col = table()->configuration_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::start_ts::type start_ts() const {
      const auto& col = table()->start_ts();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }

   protected:
    explicit ConstIterator(const EtmV4SessionTable* table,
                           Table::Iterator iterator)
        : AbstractConstIterator(table, std::move(iterator)) {}

    uint32_t CurrentRowNumber() const {
      return iterator_.StorageIndexForLastOverlay();
    }

   private:
    friend class EtmV4SessionTable;
    friend class macros_internal::AbstractConstIterator<
      ConstIterator, EtmV4SessionTable, RowNumber, ConstRowReference>;
  };
  class Iterator : public ConstIterator {
    public:
     RowReference row_reference() const {
       return {const_cast<EtmV4SessionTable*>(table()), CurrentRowNumber()};
     }

    private:
     friend class EtmV4SessionTable;

     explicit Iterator(EtmV4SessionTable* table, Table::Iterator iterator)
        : ConstIterator(table, std::move(iterator)) {}
  };

  struct IdAndRow {
    Id id;
    uint32_t row;
    RowReference row_reference;
    RowNumber row_number;
  };

  static std::vector<ColumnLegacy> GetColumns(
      EtmV4SessionTable* self,
      const macros_internal::MacroTable* parent) {
    std::vector<ColumnLegacy> columns =
        CopyColumnsFromParentOrAddRootColumns(self, parent);
    uint32_t olay_idx = OverlayCount(parent);
    AddColumnToVector(columns, "configuration_id", &self->configuration_id_, ColumnFlag::configuration_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "start_ts", &self->start_ts_, ColumnFlag::start_ts,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    return columns;
  }

  PERFETTO_NO_INLINE explicit EtmV4SessionTable(StringPool* pool)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, nullptr),
          nullptr),
        configuration_id_(ColumnStorage<ColumnType::configuration_id::stored_type>::Create<false>()),
        start_ts_(ColumnStorage<ColumnType::start_ts::stored_type>::Create<false>())
,
        id_storage_layer_(new column::IdStorage()),
        type_storage_layer_(
          new column::StringStorage(string_pool(), &type_.vector())),
        configuration_id_storage_layer_(
        new column::NumericStorage<ColumnType::configuration_id::non_optional_stored_type>(
          &configuration_id_.vector(),
          ColumnTypeHelper<ColumnType::configuration_id::stored_type>::ToColumnType(),
          false)),
        start_ts_storage_layer_(
          new column::NumericStorage<ColumnType::start_ts::non_optional_stored_type>(
            &start_ts_.non_null_vector(),
            ColumnTypeHelper<ColumnType::start_ts::stored_type>::ToColumnType(),
            false))
,
        start_ts_null_layer_(new column::NullOverlay(start_ts_.bv())) {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::configuration_id::stored_type>(
          ColumnFlag::configuration_id),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::start_ts::stored_type>(
          ColumnFlag::start_ts),
        "Column type and flag combination is not valid");
    OnConstructionCompletedRegularConstructor(
      {id_storage_layer_,type_storage_layer_,configuration_id_storage_layer_,start_ts_storage_layer_},
      {{},{},{},start_ts_null_layer_});
  }
  ~EtmV4SessionTable() override;

  static const char* Name() { return "__intrinsic_etm_v4_session"; }

  static Table::Schema ComputeStaticSchema() {
    Table::Schema schema;
    schema.columns.emplace_back(Table::Schema::Column{
        "id", SqlValue::Type::kLong, true, true, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "type", SqlValue::Type::kString, false, false, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "configuration_id", ColumnType::configuration_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "start_ts", ColumnType::start_ts::SqlValueType(), false,
        false,
        false,
        false});
    return schema;
  }

  ConstIterator IterateRows() const {
    return ConstIterator(this, Table::IterateRows());
  }

  Iterator IterateRows() { return Iterator(this, Table::IterateRows()); }

  ConstIterator FilterToIterator(const Query& q) const {
    return ConstIterator(this, QueryToIterator(q));
  }

  Iterator FilterToIterator(const Query& q) {
    return Iterator(this, QueryToIterator(q));
  }

  void ShrinkToFit() {
    type_.ShrinkToFit();
    configuration_id_.ShrinkToFit();
    start_ts_.ShrinkToFit();
  }

  ConstRowReference operator[](uint32_t r) const {
    return ConstRowReference(this, r);
  }
  RowReference operator[](uint32_t r) { return RowReference(this, r); }
  ConstRowReference operator[](RowNumber r) const {
    return ConstRowReference(this, r.row_number());
  }
  RowReference operator[](RowNumber r) {
    return RowReference(this, r.row_number());
  }

  std::optional<ConstRowReference> FindById(Id find_id) const {
    std::optional<uint32_t> row = id().IndexOf(find_id);
    return row ? std::make_optional(ConstRowReference(this, *row))
               : std::nullopt;
  }

  std::optional<RowReference> FindById(Id find_id) {
    std::optional<uint32_t> row = id().IndexOf(find_id);
    return row ? std::make_optional(RowReference(this, *row)) : std::nullopt;
  }

  IdAndRow Insert(const Row& row) {
    uint32_t row_number = row_count();
    Id id = Id{row_number};
    type_.Append(string_pool()->InternString(row.type()));
    mutable_configuration_id()->Append(row.configuration_id);
    mutable_start_ts()->Append(row.start_ts);
    UpdateSelfOverlayAfterInsert();
    return IdAndRow{id, row_number, RowReference(this, row_number),
                     RowNumber(row_number)};
  }

  

  const IdColumn<EtmV4SessionTable::Id>& id() const {
    return static_cast<const ColumnType::id&>(columns()[ColumnIndex::id]);
  }
  const TypedColumn<StringPool::Id>& type() const {
    return static_cast<const ColumnType::type&>(columns()[ColumnIndex::type]);
  }
  const TypedColumn<EtmV4ConfigurationTable::Id>& configuration_id() const {
    return static_cast<const ColumnType::configuration_id&>(columns()[ColumnIndex::configuration_id]);
  }
  const TypedColumn<std::optional<int64_t>>& start_ts() const {
    return static_cast<const ColumnType::start_ts&>(columns()[ColumnIndex::start_ts]);
  }

  TypedColumn<EtmV4ConfigurationTable::Id>* mutable_configuration_id() {
    return static_cast<ColumnType::configuration_id*>(
        GetColumn(ColumnIndex::configuration_id));
  }
  TypedColumn<std::optional<int64_t>>* mutable_start_ts() {
    return static_cast<ColumnType::start_ts*>(
        GetColumn(ColumnIndex::start_ts));
  }

 private:
  
  
  ColumnStorage<ColumnType::configuration_id::stored_type> configuration_id_;
  ColumnStorage<ColumnType::start_ts::stored_type> start_ts_;

  RefPtr<column::StorageLayer> id_storage_layer_;
  RefPtr<column::StorageLayer> type_storage_layer_;
  RefPtr<column::StorageLayer> configuration_id_storage_layer_;
  RefPtr<column::StorageLayer> start_ts_storage_layer_;

  RefPtr<column::OverlayLayer> start_ts_null_layer_;
};
  

class EtmV4TraceTable : public macros_internal::MacroTable {
 public:
  static constexpr uint32_t kColumnCount = 5;

  struct Id : public BaseId {
    Id() = default;
    explicit constexpr Id(uint32_t v) : BaseId(v) {}
  };
  static_assert(std::is_trivially_destructible_v<Id>,
                "Inheritance used without trivial destruction");
    
  struct ColumnIndex {
    static constexpr uint32_t id = 0;
    static constexpr uint32_t type = 1;
    static constexpr uint32_t session_id = 2;
    static constexpr uint32_t trace_set_id = 3;
    static constexpr uint32_t size = 4;
  };
  struct ColumnType {
    using id = IdColumn<EtmV4TraceTable::Id>;
    using type = TypedColumn<StringPool::Id>;
    using session_id = TypedColumn<EtmV4SessionTable::Id>;
    using trace_set_id = TypedColumn<uint32_t>;
    using size = TypedColumn<int64_t>;
  };
  struct Row : public macros_internal::RootParentTable::Row {
    Row(EtmV4SessionTable::Id in_session_id = {},
        uint32_t in_trace_set_id = {},
        int64_t in_size = {},
        std::nullptr_t = nullptr)
        : macros_internal::RootParentTable::Row(),
          session_id(in_session_id),
          trace_set_id(in_trace_set_id),
          size(in_size) {
      type_ = "__intrinsic_etm_v4_trace";
    }
    EtmV4SessionTable::Id session_id;
    uint32_t trace_set_id;
    int64_t size;

    bool operator==(const EtmV4TraceTable::Row& other) const {
      return type() == other.type() && ColumnType::session_id::Equals(session_id, other.session_id) &&
       ColumnType::trace_set_id::Equals(trace_set_id, other.trace_set_id) &&
       ColumnType::size::Equals(size, other.size);
    }
  };
  struct ColumnFlag {
    static constexpr uint32_t session_id = ColumnType::session_id::default_flags();
    static constexpr uint32_t trace_set_id = static_cast<uint32_t>(ColumnLegacy::Flag::kSorted | ColumnLegacy::Flag::kSetId) | ColumnType::trace_set_id::default_flags();
    static constexpr uint32_t size = ColumnType::size::default_flags();
  };

  class RowNumber;
  class ConstRowReference;
  class RowReference;

  class RowNumber : public macros_internal::AbstractRowNumber<
      EtmV4TraceTable, ConstRowReference, RowReference> {
   public:
    explicit RowNumber(uint32_t row_number)
        : AbstractRowNumber(row_number) {}
  };
  static_assert(std::is_trivially_destructible_v<RowNumber>,
                "Inheritance used without trivial destruction");

  class ConstRowReference : public macros_internal::AbstractConstRowReference<
    EtmV4TraceTable, RowNumber> {
   public:
    ConstRowReference(const EtmV4TraceTable* table, uint32_t row_number)
        : AbstractConstRowReference(table, row_number) {}

    ColumnType::id::type id() const {
      return table()->id()[row_number_];
    }
    ColumnType::type::type type() const {
      return table()->type()[row_number_];
    }
    ColumnType::session_id::type session_id() const {
      return table()->session_id()[row_number_];
    }
    ColumnType::trace_set_id::type trace_set_id() const {
      return table()->trace_set_id()[row_number_];
    }
    ColumnType::size::type size() const {
      return table()->size()[row_number_];
    }
  };
  static_assert(std::is_trivially_destructible_v<ConstRowReference>,
                "Inheritance used without trivial destruction");
  class RowReference : public ConstRowReference {
   public:
    RowReference(const EtmV4TraceTable* table, uint32_t row_number)
        : ConstRowReference(table, row_number) {}

    void set_session_id(
        ColumnType::session_id::non_optional_type v) {
      return mutable_table()->mutable_session_id()->Set(row_number_, v);
    }
    void set_trace_set_id(
        ColumnType::trace_set_id::non_optional_type v) {
      return mutable_table()->mutable_trace_set_id()->Set(row_number_, v);
    }
    void set_size(
        ColumnType::size::non_optional_type v) {
      return mutable_table()->mutable_size()->Set(row_number_, v);
    }

   private:
    EtmV4TraceTable* mutable_table() const {
      return const_cast<EtmV4TraceTable*>(table());
    }
  };
  static_assert(std::is_trivially_destructible_v<RowReference>,
                "Inheritance used without trivial destruction");

  class ConstIterator;
  class ConstIterator : public macros_internal::AbstractConstIterator<
    ConstIterator, EtmV4TraceTable, RowNumber, ConstRowReference> {
   public:
    ColumnType::id::type id() const {
      const auto& col = table()->id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::type::type type() const {
      const auto& col = table()->type();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::session_id::type session_id() const {
      const auto& col = table()->session_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::trace_set_id::type trace_set_id() const {
      const auto& col = table()->trace_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::size::type size() const {
      const auto& col = table()->size();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }

   protected:
    explicit ConstIterator(const EtmV4TraceTable* table,
                           Table::Iterator iterator)
        : AbstractConstIterator(table, std::move(iterator)) {}

    uint32_t CurrentRowNumber() const {
      return iterator_.StorageIndexForLastOverlay();
    }

   private:
    friend class EtmV4TraceTable;
    friend class macros_internal::AbstractConstIterator<
      ConstIterator, EtmV4TraceTable, RowNumber, ConstRowReference>;
  };
  class Iterator : public ConstIterator {
    public:
     RowReference row_reference() const {
       return {const_cast<EtmV4TraceTable*>(table()), CurrentRowNumber()};
     }

    private:
     friend class EtmV4TraceTable;

     explicit Iterator(EtmV4TraceTable* table, Table::Iterator iterator)
        : ConstIterator(table, std::move(iterator)) {}
  };

  struct IdAndRow {
    Id id;
    uint32_t row;
    RowReference row_reference;
    RowNumber row_number;
  };

  static std::vector<ColumnLegacy> GetColumns(
      EtmV4TraceTable* self,
      const macros_internal::MacroTable* parent) {
    std::vector<ColumnLegacy> columns =
        CopyColumnsFromParentOrAddRootColumns(self, parent);
    uint32_t olay_idx = OverlayCount(parent);
    AddColumnToVector(columns, "session_id", &self->session_id_, ColumnFlag::session_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "trace_set_id", &self->trace_set_id_, ColumnFlag::trace_set_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "size", &self->size_, ColumnFlag::size,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    return columns;
  }

  PERFETTO_NO_INLINE explicit EtmV4TraceTable(StringPool* pool)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, nullptr),
          nullptr),
        session_id_(ColumnStorage<ColumnType::session_id::stored_type>::Create<false>()),
        trace_set_id_(ColumnStorage<ColumnType::trace_set_id::stored_type>::Create<false>()),
        size_(ColumnStorage<ColumnType::size::stored_type>::Create<false>())
,
        id_storage_layer_(new column::IdStorage()),
        type_storage_layer_(
          new column::StringStorage(string_pool(), &type_.vector())),
        session_id_storage_layer_(
        new column::NumericStorage<ColumnType::session_id::non_optional_stored_type>(
          &session_id_.vector(),
          ColumnTypeHelper<ColumnType::session_id::stored_type>::ToColumnType(),
          false)),
        trace_set_id_storage_layer_(
          new column::SetIdStorage(&trace_set_id_.vector())),
        size_storage_layer_(
        new column::NumericStorage<ColumnType::size::non_optional_stored_type>(
          &size_.vector(),
          ColumnTypeHelper<ColumnType::size::stored_type>::ToColumnType(),
          false))
         {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::session_id::stored_type>(
          ColumnFlag::session_id),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::trace_set_id::stored_type>(
          ColumnFlag::trace_set_id),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::size::stored_type>(
          ColumnFlag::size),
        "Column type and flag combination is not valid");
    OnConstructionCompletedRegularConstructor(
      {id_storage_layer_,type_storage_layer_,session_id_storage_layer_,trace_set_id_storage_layer_,size_storage_layer_},
      {{},{},{},{},{}});
  }
  ~EtmV4TraceTable() override;

  static const char* Name() { return "__intrinsic_etm_v4_trace"; }

  static Table::Schema ComputeStaticSchema() {
    Table::Schema schema;
    schema.columns.emplace_back(Table::Schema::Column{
        "id", SqlValue::Type::kLong, true, true, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "type", SqlValue::Type::kString, false, false, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "session_id", ColumnType::session_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "trace_set_id", ColumnType::trace_set_id::SqlValueType(), false,
        true,
        false,
        true});
    schema.columns.emplace_back(Table::Schema::Column{
        "size", ColumnType::size::SqlValueType(), false,
        false,
        false,
        false});
    return schema;
  }

  ConstIterator IterateRows() const {
    return ConstIterator(this, Table::IterateRows());
  }

  Iterator IterateRows() { return Iterator(this, Table::IterateRows()); }

  ConstIterator FilterToIterator(const Query& q) const {
    return ConstIterator(this, QueryToIterator(q));
  }

  Iterator FilterToIterator(const Query& q) {
    return Iterator(this, QueryToIterator(q));
  }

  void ShrinkToFit() {
    type_.ShrinkToFit();
    session_id_.ShrinkToFit();
    trace_set_id_.ShrinkToFit();
    size_.ShrinkToFit();
  }

  ConstRowReference operator[](uint32_t r) const {
    return ConstRowReference(this, r);
  }
  RowReference operator[](uint32_t r) { return RowReference(this, r); }
  ConstRowReference operator[](RowNumber r) const {
    return ConstRowReference(this, r.row_number());
  }
  RowReference operator[](RowNumber r) {
    return RowReference(this, r.row_number());
  }

  std::optional<ConstRowReference> FindById(Id find_id) const {
    std::optional<uint32_t> row = id().IndexOf(find_id);
    return row ? std::make_optional(ConstRowReference(this, *row))
               : std::nullopt;
  }

  std::optional<RowReference> FindById(Id find_id) {
    std::optional<uint32_t> row = id().IndexOf(find_id);
    return row ? std::make_optional(RowReference(this, *row)) : std::nullopt;
  }

  IdAndRow Insert(const Row& row) {
    uint32_t row_number = row_count();
    Id id = Id{row_number};
    type_.Append(string_pool()->InternString(row.type()));
    mutable_session_id()->Append(row.session_id);
    mutable_trace_set_id()->Append(row.trace_set_id);
    mutable_size()->Append(row.size);
    UpdateSelfOverlayAfterInsert();
    return IdAndRow{id, row_number, RowReference(this, row_number),
                     RowNumber(row_number)};
  }

  

  const IdColumn<EtmV4TraceTable::Id>& id() const {
    return static_cast<const ColumnType::id&>(columns()[ColumnIndex::id]);
  }
  const TypedColumn<StringPool::Id>& type() const {
    return static_cast<const ColumnType::type&>(columns()[ColumnIndex::type]);
  }
  const TypedColumn<EtmV4SessionTable::Id>& session_id() const {
    return static_cast<const ColumnType::session_id&>(columns()[ColumnIndex::session_id]);
  }
  const TypedColumn<uint32_t>& trace_set_id() const {
    return static_cast<const ColumnType::trace_set_id&>(columns()[ColumnIndex::trace_set_id]);
  }
  const TypedColumn<int64_t>& size() const {
    return static_cast<const ColumnType::size&>(columns()[ColumnIndex::size]);
  }

  TypedColumn<EtmV4SessionTable::Id>* mutable_session_id() {
    return static_cast<ColumnType::session_id*>(
        GetColumn(ColumnIndex::session_id));
  }
  TypedColumn<uint32_t>* mutable_trace_set_id() {
    return static_cast<ColumnType::trace_set_id*>(
        GetColumn(ColumnIndex::trace_set_id));
  }
  TypedColumn<int64_t>* mutable_size() {
    return static_cast<ColumnType::size*>(
        GetColumn(ColumnIndex::size));
  }

 private:
  
  
  ColumnStorage<ColumnType::session_id::stored_type> session_id_;
  ColumnStorage<ColumnType::trace_set_id::stored_type> trace_set_id_;
  ColumnStorage<ColumnType::size::stored_type> size_;

  RefPtr<column::StorageLayer> id_storage_layer_;
  RefPtr<column::StorageLayer> type_storage_layer_;
  RefPtr<column::StorageLayer> session_id_storage_layer_;
  RefPtr<column::StorageLayer> trace_set_id_storage_layer_;
  RefPtr<column::StorageLayer> size_storage_layer_;

  
};

}  // namespace perfetto

#endif  // SRC_TRACE_PROCESSOR_TABLES_ETM_TABLES_PY_H_
