#ifndef SRC_TRACE_PROCESSOR_TABLES_TRACK_TABLES_PY_H_
#define SRC_TRACE_PROCESSOR_TABLES_TRACK_TABLES_PY_H_

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

#include "src/trace_processor/tables/metadata_tables_py.h"

namespace perfetto::trace_processor::tables {

class TrackTable : public macros_internal::MacroTable {
 public:
  static constexpr uint32_t kColumnCount = 10;

  struct Id : public BaseId {
    Id() = default;
    explicit constexpr Id(uint32_t v) : BaseId(v) {}
  };
  static_assert(std::is_trivially_destructible_v<Id>,
                "Inheritance used without trivial destruction");
    
  struct ColumnIndex {
    static constexpr uint32_t id = 0;
    static constexpr uint32_t type = 1;
    static constexpr uint32_t name = 2;
    static constexpr uint32_t parent_id = 3;
    static constexpr uint32_t source_arg_set_id = 4;
    static constexpr uint32_t machine_id = 5;
    static constexpr uint32_t classification = 6;
    static constexpr uint32_t dimension_arg_set_id = 7;
    static constexpr uint32_t event_type = 8;
    static constexpr uint32_t counter_unit = 9;
  };
  struct ColumnType {
    using id = IdColumn<TrackTable::Id>;
    using type = TypedColumn<StringPool::Id>;
    using name = TypedColumn<StringPool::Id>;
    using parent_id = TypedColumn<std::optional<TrackTable::Id>>;
    using source_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using machine_id = TypedColumn<std::optional<MachineTable::Id>>;
    using classification = TypedColumn<StringPool::Id>;
    using dimension_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using event_type = TypedColumn<StringPool::Id>;
    using counter_unit = TypedColumn<std::optional<StringPool::Id>>;
  };
  struct Row : public macros_internal::RootParentTable::Row {
    Row(StringPool::Id in_name = {},
        std::optional<TrackTable::Id> in_parent_id = {},
        std::optional<uint32_t> in_source_arg_set_id = {},
        std::optional<MachineTable::Id> in_machine_id = {},
        StringPool::Id in_classification = {},
        std::optional<uint32_t> in_dimension_arg_set_id = {},
        StringPool::Id in_event_type = {},
        std::optional<StringPool::Id> in_counter_unit = {},
        std::nullptr_t = nullptr)
        : macros_internal::RootParentTable::Row(),
          name(in_name),
          parent_id(in_parent_id),
          source_arg_set_id(in_source_arg_set_id),
          machine_id(in_machine_id),
          classification(in_classification),
          dimension_arg_set_id(in_dimension_arg_set_id),
          event_type(in_event_type),
          counter_unit(in_counter_unit) {
      type_ = "__intrinsic_track";
    }
    StringPool::Id name;
    std::optional<TrackTable::Id> parent_id;
    std::optional<uint32_t> source_arg_set_id;
    std::optional<MachineTable::Id> machine_id;
    StringPool::Id classification;
    std::optional<uint32_t> dimension_arg_set_id;
    StringPool::Id event_type;
    std::optional<StringPool::Id> counter_unit;

    bool operator==(const TrackTable::Row& other) const {
      return type() == other.type() && ColumnType::name::Equals(name, other.name) &&
       ColumnType::parent_id::Equals(parent_id, other.parent_id) &&
       ColumnType::source_arg_set_id::Equals(source_arg_set_id, other.source_arg_set_id) &&
       ColumnType::machine_id::Equals(machine_id, other.machine_id) &&
       ColumnType::classification::Equals(classification, other.classification) &&
       ColumnType::dimension_arg_set_id::Equals(dimension_arg_set_id, other.dimension_arg_set_id) &&
       ColumnType::event_type::Equals(event_type, other.event_type) &&
       ColumnType::counter_unit::Equals(counter_unit, other.counter_unit);
    }
  };
  struct ColumnFlag {
    static constexpr uint32_t name = ColumnType::name::default_flags();
    static constexpr uint32_t parent_id = ColumnType::parent_id::default_flags();
    static constexpr uint32_t source_arg_set_id = ColumnType::source_arg_set_id::default_flags();
    static constexpr uint32_t machine_id = ColumnType::machine_id::default_flags();
    static constexpr uint32_t classification = ColumnType::classification::default_flags();
    static constexpr uint32_t dimension_arg_set_id = ColumnType::dimension_arg_set_id::default_flags();
    static constexpr uint32_t event_type = ColumnType::event_type::default_flags();
    static constexpr uint32_t counter_unit = ColumnType::counter_unit::default_flags();
  };

  class RowNumber;
  class ConstRowReference;
  class RowReference;

  class RowNumber : public macros_internal::AbstractRowNumber<
      TrackTable, ConstRowReference, RowReference> {
   public:
    explicit RowNumber(uint32_t row_number)
        : AbstractRowNumber(row_number) {}
  };
  static_assert(std::is_trivially_destructible_v<RowNumber>,
                "Inheritance used without trivial destruction");

  class ConstRowReference : public macros_internal::AbstractConstRowReference<
    TrackTable, RowNumber> {
   public:
    ConstRowReference(const TrackTable* table, uint32_t row_number)
        : AbstractConstRowReference(table, row_number) {}

    ColumnType::id::type id() const {
      return table()->id()[row_number_];
    }
    ColumnType::type::type type() const {
      return table()->type()[row_number_];
    }
    ColumnType::name::type name() const {
      return table()->name()[row_number_];
    }
    ColumnType::parent_id::type parent_id() const {
      return table()->parent_id()[row_number_];
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      return table()->source_arg_set_id()[row_number_];
    }
    ColumnType::machine_id::type machine_id() const {
      return table()->machine_id()[row_number_];
    }
    ColumnType::classification::type classification() const {
      return table()->classification()[row_number_];
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      return table()->dimension_arg_set_id()[row_number_];
    }
    ColumnType::event_type::type event_type() const {
      return table()->event_type()[row_number_];
    }
    ColumnType::counter_unit::type counter_unit() const {
      return table()->counter_unit()[row_number_];
    }
  };
  static_assert(std::is_trivially_destructible_v<ConstRowReference>,
                "Inheritance used without trivial destruction");
  class RowReference : public ConstRowReference {
   public:
    RowReference(const TrackTable* table, uint32_t row_number)
        : ConstRowReference(table, row_number) {}

    void set_name(
        ColumnType::name::non_optional_type v) {
      return mutable_table()->mutable_name()->Set(row_number_, v);
    }
    void set_parent_id(
        ColumnType::parent_id::non_optional_type v) {
      return mutable_table()->mutable_parent_id()->Set(row_number_, v);
    }
    void set_source_arg_set_id(
        ColumnType::source_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_source_arg_set_id()->Set(row_number_, v);
    }
    void set_machine_id(
        ColumnType::machine_id::non_optional_type v) {
      return mutable_table()->mutable_machine_id()->Set(row_number_, v);
    }
    void set_classification(
        ColumnType::classification::non_optional_type v) {
      return mutable_table()->mutable_classification()->Set(row_number_, v);
    }
    void set_dimension_arg_set_id(
        ColumnType::dimension_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_dimension_arg_set_id()->Set(row_number_, v);
    }
    void set_event_type(
        ColumnType::event_type::non_optional_type v) {
      return mutable_table()->mutable_event_type()->Set(row_number_, v);
    }
    void set_counter_unit(
        ColumnType::counter_unit::non_optional_type v) {
      return mutable_table()->mutable_counter_unit()->Set(row_number_, v);
    }

   private:
    TrackTable* mutable_table() const {
      return const_cast<TrackTable*>(table());
    }
  };
  static_assert(std::is_trivially_destructible_v<RowReference>,
                "Inheritance used without trivial destruction");

  class ConstIterator;
  class ConstIterator : public macros_internal::AbstractConstIterator<
    ConstIterator, TrackTable, RowNumber, ConstRowReference> {
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
    ColumnType::name::type name() const {
      const auto& col = table()->name();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::parent_id::type parent_id() const {
      const auto& col = table()->parent_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      const auto& col = table()->source_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::machine_id::type machine_id() const {
      const auto& col = table()->machine_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::classification::type classification() const {
      const auto& col = table()->classification();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      const auto& col = table()->dimension_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::event_type::type event_type() const {
      const auto& col = table()->event_type();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::counter_unit::type counter_unit() const {
      const auto& col = table()->counter_unit();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }

   protected:
    explicit ConstIterator(const TrackTable* table,
                           Table::Iterator iterator)
        : AbstractConstIterator(table, std::move(iterator)) {}

    uint32_t CurrentRowNumber() const {
      return iterator_.StorageIndexForLastOverlay();
    }

   private:
    friend class TrackTable;
    friend class macros_internal::AbstractConstIterator<
      ConstIterator, TrackTable, RowNumber, ConstRowReference>;
  };
  class Iterator : public ConstIterator {
    public:
     RowReference row_reference() const {
       return {const_cast<TrackTable*>(table()), CurrentRowNumber()};
     }

    private:
     friend class TrackTable;

     explicit Iterator(TrackTable* table, Table::Iterator iterator)
        : ConstIterator(table, std::move(iterator)) {}
  };

  struct IdAndRow {
    Id id;
    uint32_t row;
    RowReference row_reference;
    RowNumber row_number;
  };

  static std::vector<ColumnLegacy> GetColumns(
      TrackTable* self,
      const macros_internal::MacroTable* parent) {
    std::vector<ColumnLegacy> columns =
        CopyColumnsFromParentOrAddRootColumns(self, parent);
    uint32_t olay_idx = OverlayCount(parent);
    AddColumnToVector(columns, "name", &self->name_, ColumnFlag::name,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "parent_id", &self->parent_id_, ColumnFlag::parent_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "source_arg_set_id", &self->source_arg_set_id_, ColumnFlag::source_arg_set_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "machine_id", &self->machine_id_, ColumnFlag::machine_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "classification", &self->classification_, ColumnFlag::classification,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "dimension_arg_set_id", &self->dimension_arg_set_id_, ColumnFlag::dimension_arg_set_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "event_type", &self->event_type_, ColumnFlag::event_type,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "counter_unit", &self->counter_unit_, ColumnFlag::counter_unit,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    return columns;
  }

  PERFETTO_NO_INLINE explicit TrackTable(StringPool* pool)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, nullptr),
          nullptr),
        name_(ColumnStorage<ColumnType::name::stored_type>::Create<false>()),
        parent_id_(ColumnStorage<ColumnType::parent_id::stored_type>::Create<false>()),
        source_arg_set_id_(ColumnStorage<ColumnType::source_arg_set_id::stored_type>::Create<false>()),
        machine_id_(ColumnStorage<ColumnType::machine_id::stored_type>::Create<false>()),
        classification_(ColumnStorage<ColumnType::classification::stored_type>::Create<false>()),
        dimension_arg_set_id_(ColumnStorage<ColumnType::dimension_arg_set_id::stored_type>::Create<false>()),
        event_type_(ColumnStorage<ColumnType::event_type::stored_type>::Create<false>()),
        counter_unit_(ColumnStorage<ColumnType::counter_unit::stored_type>::Create<false>())
,
        id_storage_layer_(new column::IdStorage()),
        type_storage_layer_(
          new column::StringStorage(string_pool(), &type_.vector())),
        name_storage_layer_(
          new column::StringStorage(string_pool(), &name_.vector())),
        parent_id_storage_layer_(
          new column::NumericStorage<ColumnType::parent_id::non_optional_stored_type>(
            &parent_id_.non_null_vector(),
            ColumnTypeHelper<ColumnType::parent_id::stored_type>::ToColumnType(),
            false)),
        source_arg_set_id_storage_layer_(
          new column::NumericStorage<ColumnType::source_arg_set_id::non_optional_stored_type>(
            &source_arg_set_id_.non_null_vector(),
            ColumnTypeHelper<ColumnType::source_arg_set_id::stored_type>::ToColumnType(),
            false)),
        machine_id_storage_layer_(
          new column::NumericStorage<ColumnType::machine_id::non_optional_stored_type>(
            &machine_id_.non_null_vector(),
            ColumnTypeHelper<ColumnType::machine_id::stored_type>::ToColumnType(),
            false)),
        classification_storage_layer_(
          new column::StringStorage(string_pool(), &classification_.vector())),
        dimension_arg_set_id_storage_layer_(
          new column::NumericStorage<ColumnType::dimension_arg_set_id::non_optional_stored_type>(
            &dimension_arg_set_id_.non_null_vector(),
            ColumnTypeHelper<ColumnType::dimension_arg_set_id::stored_type>::ToColumnType(),
            false)),
        event_type_storage_layer_(
          new column::StringStorage(string_pool(), &event_type_.vector())),
        counter_unit_storage_layer_(
          new column::StringStorage(string_pool(), &counter_unit_.vector()))
,
        parent_id_null_layer_(new column::NullOverlay(parent_id_.bv())),
        source_arg_set_id_null_layer_(new column::NullOverlay(source_arg_set_id_.bv())),
        machine_id_null_layer_(new column::NullOverlay(machine_id_.bv())),
        dimension_arg_set_id_null_layer_(new column::NullOverlay(dimension_arg_set_id_.bv())) {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::name::stored_type>(
          ColumnFlag::name),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::parent_id::stored_type>(
          ColumnFlag::parent_id),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::source_arg_set_id::stored_type>(
          ColumnFlag::source_arg_set_id),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::machine_id::stored_type>(
          ColumnFlag::machine_id),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::classification::stored_type>(
          ColumnFlag::classification),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::dimension_arg_set_id::stored_type>(
          ColumnFlag::dimension_arg_set_id),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::event_type::stored_type>(
          ColumnFlag::event_type),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::counter_unit::stored_type>(
          ColumnFlag::counter_unit),
        "Column type and flag combination is not valid");
    OnConstructionCompletedRegularConstructor(
      {id_storage_layer_,type_storage_layer_,name_storage_layer_,parent_id_storage_layer_,source_arg_set_id_storage_layer_,machine_id_storage_layer_,classification_storage_layer_,dimension_arg_set_id_storage_layer_,event_type_storage_layer_,counter_unit_storage_layer_},
      {{},{},{},parent_id_null_layer_,source_arg_set_id_null_layer_,machine_id_null_layer_,{},dimension_arg_set_id_null_layer_,{},{}});
  }
  ~TrackTable() override;

  static const char* Name() { return "__intrinsic_track"; }

  static Table::Schema ComputeStaticSchema() {
    Table::Schema schema;
    schema.columns.emplace_back(Table::Schema::Column{
        "id", SqlValue::Type::kLong, true, true, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "type", SqlValue::Type::kString, false, false, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "name", ColumnType::name::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "parent_id", ColumnType::parent_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "source_arg_set_id", ColumnType::source_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "machine_id", ColumnType::machine_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "classification", ColumnType::classification::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "dimension_arg_set_id", ColumnType::dimension_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "event_type", ColumnType::event_type::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "counter_unit", ColumnType::counter_unit::SqlValueType(), false,
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
    name_.ShrinkToFit();
    parent_id_.ShrinkToFit();
    source_arg_set_id_.ShrinkToFit();
    machine_id_.ShrinkToFit();
    classification_.ShrinkToFit();
    dimension_arg_set_id_.ShrinkToFit();
    event_type_.ShrinkToFit();
    counter_unit_.ShrinkToFit();
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
    mutable_name()->Append(row.name);
    mutable_parent_id()->Append(row.parent_id);
    mutable_source_arg_set_id()->Append(row.source_arg_set_id);
    mutable_machine_id()->Append(row.machine_id);
    mutable_classification()->Append(row.classification);
    mutable_dimension_arg_set_id()->Append(row.dimension_arg_set_id);
    mutable_event_type()->Append(row.event_type);
    mutable_counter_unit()->Append(row.counter_unit);
    UpdateSelfOverlayAfterInsert();
    return IdAndRow{id, row_number, RowReference(this, row_number),
                     RowNumber(row_number)};
  }

  

  const IdColumn<TrackTable::Id>& id() const {
    return static_cast<const ColumnType::id&>(columns()[ColumnIndex::id]);
  }
  const TypedColumn<StringPool::Id>& type() const {
    return static_cast<const ColumnType::type&>(columns()[ColumnIndex::type]);
  }
  const TypedColumn<StringPool::Id>& name() const {
    return static_cast<const ColumnType::name&>(columns()[ColumnIndex::name]);
  }
  const TypedColumn<std::optional<TrackTable::Id>>& parent_id() const {
    return static_cast<const ColumnType::parent_id&>(columns()[ColumnIndex::parent_id]);
  }
  const TypedColumn<std::optional<uint32_t>>& source_arg_set_id() const {
    return static_cast<const ColumnType::source_arg_set_id&>(columns()[ColumnIndex::source_arg_set_id]);
  }
  const TypedColumn<std::optional<MachineTable::Id>>& machine_id() const {
    return static_cast<const ColumnType::machine_id&>(columns()[ColumnIndex::machine_id]);
  }
  const TypedColumn<StringPool::Id>& classification() const {
    return static_cast<const ColumnType::classification&>(columns()[ColumnIndex::classification]);
  }
  const TypedColumn<std::optional<uint32_t>>& dimension_arg_set_id() const {
    return static_cast<const ColumnType::dimension_arg_set_id&>(columns()[ColumnIndex::dimension_arg_set_id]);
  }
  const TypedColumn<StringPool::Id>& event_type() const {
    return static_cast<const ColumnType::event_type&>(columns()[ColumnIndex::event_type]);
  }
  const TypedColumn<std::optional<StringPool::Id>>& counter_unit() const {
    return static_cast<const ColumnType::counter_unit&>(columns()[ColumnIndex::counter_unit]);
  }

  TypedColumn<StringPool::Id>* mutable_name() {
    return static_cast<ColumnType::name*>(
        GetColumn(ColumnIndex::name));
  }
  TypedColumn<std::optional<TrackTable::Id>>* mutable_parent_id() {
    return static_cast<ColumnType::parent_id*>(
        GetColumn(ColumnIndex::parent_id));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_source_arg_set_id() {
    return static_cast<ColumnType::source_arg_set_id*>(
        GetColumn(ColumnIndex::source_arg_set_id));
  }
  TypedColumn<std::optional<MachineTable::Id>>* mutable_machine_id() {
    return static_cast<ColumnType::machine_id*>(
        GetColumn(ColumnIndex::machine_id));
  }
  TypedColumn<StringPool::Id>* mutable_classification() {
    return static_cast<ColumnType::classification*>(
        GetColumn(ColumnIndex::classification));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_dimension_arg_set_id() {
    return static_cast<ColumnType::dimension_arg_set_id*>(
        GetColumn(ColumnIndex::dimension_arg_set_id));
  }
  TypedColumn<StringPool::Id>* mutable_event_type() {
    return static_cast<ColumnType::event_type*>(
        GetColumn(ColumnIndex::event_type));
  }
  TypedColumn<std::optional<StringPool::Id>>* mutable_counter_unit() {
    return static_cast<ColumnType::counter_unit*>(
        GetColumn(ColumnIndex::counter_unit));
  }

 private:
  
  
  ColumnStorage<ColumnType::name::stored_type> name_;
  ColumnStorage<ColumnType::parent_id::stored_type> parent_id_;
  ColumnStorage<ColumnType::source_arg_set_id::stored_type> source_arg_set_id_;
  ColumnStorage<ColumnType::machine_id::stored_type> machine_id_;
  ColumnStorage<ColumnType::classification::stored_type> classification_;
  ColumnStorage<ColumnType::dimension_arg_set_id::stored_type> dimension_arg_set_id_;
  ColumnStorage<ColumnType::event_type::stored_type> event_type_;
  ColumnStorage<ColumnType::counter_unit::stored_type> counter_unit_;

  RefPtr<column::StorageLayer> id_storage_layer_;
  RefPtr<column::StorageLayer> type_storage_layer_;
  RefPtr<column::StorageLayer> name_storage_layer_;
  RefPtr<column::StorageLayer> parent_id_storage_layer_;
  RefPtr<column::StorageLayer> source_arg_set_id_storage_layer_;
  RefPtr<column::StorageLayer> machine_id_storage_layer_;
  RefPtr<column::StorageLayer> classification_storage_layer_;
  RefPtr<column::StorageLayer> dimension_arg_set_id_storage_layer_;
  RefPtr<column::StorageLayer> event_type_storage_layer_;
  RefPtr<column::StorageLayer> counter_unit_storage_layer_;

  RefPtr<column::OverlayLayer> parent_id_null_layer_;
  RefPtr<column::OverlayLayer> source_arg_set_id_null_layer_;
  RefPtr<column::OverlayLayer> machine_id_null_layer_;
  RefPtr<column::OverlayLayer> dimension_arg_set_id_null_layer_;
};
  

class CpuTrackTable : public macros_internal::MacroTable {
 public:
  static constexpr uint32_t kColumnCount = 11;

  using Id = TrackTable::Id;
    
  struct ColumnIndex {
    static constexpr uint32_t id = 0;
    static constexpr uint32_t type = 1;
    static constexpr uint32_t name = 2;
    static constexpr uint32_t parent_id = 3;
    static constexpr uint32_t source_arg_set_id = 4;
    static constexpr uint32_t machine_id = 5;
    static constexpr uint32_t classification = 6;
    static constexpr uint32_t dimension_arg_set_id = 7;
    static constexpr uint32_t event_type = 8;
    static constexpr uint32_t counter_unit = 9;
    static constexpr uint32_t cpu = 10;
  };
  struct ColumnType {
    using id = IdColumn<CpuTrackTable::Id>;
    using type = TypedColumn<StringPool::Id>;
    using name = TypedColumn<StringPool::Id>;
    using parent_id = TypedColumn<std::optional<CpuTrackTable::Id>>;
    using source_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using machine_id = TypedColumn<std::optional<MachineTable::Id>>;
    using classification = TypedColumn<StringPool::Id>;
    using dimension_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using event_type = TypedColumn<StringPool::Id>;
    using counter_unit = TypedColumn<std::optional<StringPool::Id>>;
    using cpu = TypedColumn<uint32_t>;
  };
  struct Row : public TrackTable::Row {
    Row(StringPool::Id in_name = {},
        std::optional<CpuTrackTable::Id> in_parent_id = {},
        std::optional<uint32_t> in_source_arg_set_id = {},
        std::optional<MachineTable::Id> in_machine_id = {},
        StringPool::Id in_classification = {},
        std::optional<uint32_t> in_dimension_arg_set_id = {},
        StringPool::Id in_event_type = {},
        std::optional<StringPool::Id> in_counter_unit = {},
        uint32_t in_cpu = {},
        std::nullptr_t = nullptr)
        : TrackTable::Row(in_name, in_parent_id, in_source_arg_set_id, in_machine_id, in_classification, in_dimension_arg_set_id, in_event_type, in_counter_unit),
          cpu(in_cpu) {
      type_ = "__intrinsic_cpu_track";
    }
    uint32_t cpu;

    bool operator==(const CpuTrackTable::Row& other) const {
      return type() == other.type() && ColumnType::name::Equals(name, other.name) &&
       ColumnType::parent_id::Equals(parent_id, other.parent_id) &&
       ColumnType::source_arg_set_id::Equals(source_arg_set_id, other.source_arg_set_id) &&
       ColumnType::machine_id::Equals(machine_id, other.machine_id) &&
       ColumnType::classification::Equals(classification, other.classification) &&
       ColumnType::dimension_arg_set_id::Equals(dimension_arg_set_id, other.dimension_arg_set_id) &&
       ColumnType::event_type::Equals(event_type, other.event_type) &&
       ColumnType::counter_unit::Equals(counter_unit, other.counter_unit) &&
       ColumnType::cpu::Equals(cpu, other.cpu);
    }
  };
  struct ColumnFlag {
    static constexpr uint32_t cpu = ColumnType::cpu::default_flags();
  };

  class RowNumber;
  class ConstRowReference;
  class RowReference;

  class RowNumber : public macros_internal::AbstractRowNumber<
      CpuTrackTable, ConstRowReference, RowReference> {
   public:
    explicit RowNumber(uint32_t row_number)
        : AbstractRowNumber(row_number) {}
  };
  static_assert(std::is_trivially_destructible_v<RowNumber>,
                "Inheritance used without trivial destruction");

  class ConstRowReference : public macros_internal::AbstractConstRowReference<
    CpuTrackTable, RowNumber> {
   public:
    ConstRowReference(const CpuTrackTable* table, uint32_t row_number)
        : AbstractConstRowReference(table, row_number) {}

    ColumnType::id::type id() const {
      return table()->id()[row_number_];
    }
    ColumnType::type::type type() const {
      return table()->type()[row_number_];
    }
    ColumnType::name::type name() const {
      return table()->name()[row_number_];
    }
    ColumnType::parent_id::type parent_id() const {
      return table()->parent_id()[row_number_];
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      return table()->source_arg_set_id()[row_number_];
    }
    ColumnType::machine_id::type machine_id() const {
      return table()->machine_id()[row_number_];
    }
    ColumnType::classification::type classification() const {
      return table()->classification()[row_number_];
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      return table()->dimension_arg_set_id()[row_number_];
    }
    ColumnType::event_type::type event_type() const {
      return table()->event_type()[row_number_];
    }
    ColumnType::counter_unit::type counter_unit() const {
      return table()->counter_unit()[row_number_];
    }
    ColumnType::cpu::type cpu() const {
      return table()->cpu()[row_number_];
    }
  };
  static_assert(std::is_trivially_destructible_v<ConstRowReference>,
                "Inheritance used without trivial destruction");
  class RowReference : public ConstRowReference {
   public:
    RowReference(const CpuTrackTable* table, uint32_t row_number)
        : ConstRowReference(table, row_number) {}

    void set_name(
        ColumnType::name::non_optional_type v) {
      return mutable_table()->mutable_name()->Set(row_number_, v);
    }
    void set_parent_id(
        ColumnType::parent_id::non_optional_type v) {
      return mutable_table()->mutable_parent_id()->Set(row_number_, v);
    }
    void set_source_arg_set_id(
        ColumnType::source_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_source_arg_set_id()->Set(row_number_, v);
    }
    void set_machine_id(
        ColumnType::machine_id::non_optional_type v) {
      return mutable_table()->mutable_machine_id()->Set(row_number_, v);
    }
    void set_classification(
        ColumnType::classification::non_optional_type v) {
      return mutable_table()->mutable_classification()->Set(row_number_, v);
    }
    void set_dimension_arg_set_id(
        ColumnType::dimension_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_dimension_arg_set_id()->Set(row_number_, v);
    }
    void set_event_type(
        ColumnType::event_type::non_optional_type v) {
      return mutable_table()->mutable_event_type()->Set(row_number_, v);
    }
    void set_counter_unit(
        ColumnType::counter_unit::non_optional_type v) {
      return mutable_table()->mutable_counter_unit()->Set(row_number_, v);
    }
    void set_cpu(
        ColumnType::cpu::non_optional_type v) {
      return mutable_table()->mutable_cpu()->Set(row_number_, v);
    }

   private:
    CpuTrackTable* mutable_table() const {
      return const_cast<CpuTrackTable*>(table());
    }
  };
  static_assert(std::is_trivially_destructible_v<RowReference>,
                "Inheritance used without trivial destruction");

  class ConstIterator;
  class ConstIterator : public macros_internal::AbstractConstIterator<
    ConstIterator, CpuTrackTable, RowNumber, ConstRowReference> {
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
    ColumnType::name::type name() const {
      const auto& col = table()->name();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::parent_id::type parent_id() const {
      const auto& col = table()->parent_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      const auto& col = table()->source_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::machine_id::type machine_id() const {
      const auto& col = table()->machine_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::classification::type classification() const {
      const auto& col = table()->classification();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      const auto& col = table()->dimension_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::event_type::type event_type() const {
      const auto& col = table()->event_type();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::counter_unit::type counter_unit() const {
      const auto& col = table()->counter_unit();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::cpu::type cpu() const {
      const auto& col = table()->cpu();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }

   protected:
    explicit ConstIterator(const CpuTrackTable* table,
                           Table::Iterator iterator)
        : AbstractConstIterator(table, std::move(iterator)) {}

    uint32_t CurrentRowNumber() const {
      return iterator_.StorageIndexForLastOverlay();
    }

   private:
    friend class CpuTrackTable;
    friend class macros_internal::AbstractConstIterator<
      ConstIterator, CpuTrackTable, RowNumber, ConstRowReference>;
  };
  class Iterator : public ConstIterator {
    public:
     RowReference row_reference() const {
       return {const_cast<CpuTrackTable*>(table()), CurrentRowNumber()};
     }

    private:
     friend class CpuTrackTable;

     explicit Iterator(CpuTrackTable* table, Table::Iterator iterator)
        : ConstIterator(table, std::move(iterator)) {}
  };

  struct IdAndRow {
    Id id;
    uint32_t row;
    RowReference row_reference;
    RowNumber row_number;
  };

  static std::vector<ColumnLegacy> GetColumns(
      CpuTrackTable* self,
      const macros_internal::MacroTable* parent) {
    std::vector<ColumnLegacy> columns =
        CopyColumnsFromParentOrAddRootColumns(self, parent);
    uint32_t olay_idx = OverlayCount(parent);
    AddColumnToVector(columns, "cpu", &self->cpu_, ColumnFlag::cpu,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    return columns;
  }

  PERFETTO_NO_INLINE explicit CpuTrackTable(StringPool* pool, TrackTable* parent)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, parent),
          parent),
        parent_(parent), const_parent_(parent), cpu_(ColumnStorage<ColumnType::cpu::stored_type>::Create<false>())
,
        cpu_storage_layer_(
        new column::NumericStorage<ColumnType::cpu::non_optional_stored_type>(
          &cpu_.vector(),
          ColumnTypeHelper<ColumnType::cpu::stored_type>::ToColumnType(),
          false))
         {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::cpu::stored_type>(
          ColumnFlag::cpu),
        "Column type and flag combination is not valid");
    OnConstructionCompletedRegularConstructor(
      {const_parent_->storage_layers()[ColumnIndex::id],const_parent_->storage_layers()[ColumnIndex::type],const_parent_->storage_layers()[ColumnIndex::name],const_parent_->storage_layers()[ColumnIndex::parent_id],const_parent_->storage_layers()[ColumnIndex::source_arg_set_id],const_parent_->storage_layers()[ColumnIndex::machine_id],const_parent_->storage_layers()[ColumnIndex::classification],const_parent_->storage_layers()[ColumnIndex::dimension_arg_set_id],const_parent_->storage_layers()[ColumnIndex::event_type],const_parent_->storage_layers()[ColumnIndex::counter_unit],cpu_storage_layer_},
      {{},{},{},const_parent_->null_layers()[ColumnIndex::parent_id],const_parent_->null_layers()[ColumnIndex::source_arg_set_id],const_parent_->null_layers()[ColumnIndex::machine_id],{},const_parent_->null_layers()[ColumnIndex::dimension_arg_set_id],{},{},{}});
  }
  ~CpuTrackTable() override;

  static const char* Name() { return "__intrinsic_cpu_track"; }

  static Table::Schema ComputeStaticSchema() {
    Table::Schema schema;
    schema.columns.emplace_back(Table::Schema::Column{
        "id", SqlValue::Type::kLong, true, true, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "type", SqlValue::Type::kString, false, false, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "name", ColumnType::name::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "parent_id", ColumnType::parent_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "source_arg_set_id", ColumnType::source_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "machine_id", ColumnType::machine_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "classification", ColumnType::classification::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "dimension_arg_set_id", ColumnType::dimension_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "event_type", ColumnType::event_type::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "counter_unit", ColumnType::counter_unit::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "cpu", ColumnType::cpu::SqlValueType(), false,
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
    cpu_.ShrinkToFit();
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
    Id id = Id{parent_->Insert(row).id};
    UpdateOverlaysAfterParentInsert();
    mutable_cpu()->Append(row.cpu);
    UpdateSelfOverlayAfterInsert();
    return IdAndRow{id, row_number, RowReference(this, row_number),
                     RowNumber(row_number)};
  }

  static std::unique_ptr<CpuTrackTable> ExtendParent(
      const TrackTable& parent,
      ColumnStorage<ColumnType::cpu::stored_type> cpu) {
    return std::unique_ptr<CpuTrackTable>(new CpuTrackTable(
        parent.string_pool(), parent, RowMap(0, parent.row_count()),
        std::move(cpu)));
  }

  static std::unique_ptr<CpuTrackTable> SelectAndExtendParent(
      const TrackTable& parent,
      std::vector<TrackTable::RowNumber> parent_overlay,
      ColumnStorage<ColumnType::cpu::stored_type> cpu) {
    std::vector<uint32_t> prs_untyped(parent_overlay.size());
    for (uint32_t i = 0; i < parent_overlay.size(); ++i) {
      prs_untyped[i] = parent_overlay[i].row_number();
    }
    return std::unique_ptr<CpuTrackTable>(new CpuTrackTable(
        parent.string_pool(), parent, RowMap(std::move(prs_untyped)),
        std::move(cpu)));
  }

  const IdColumn<CpuTrackTable::Id>& id() const {
    return static_cast<const ColumnType::id&>(columns()[ColumnIndex::id]);
  }
  const TypedColumn<StringPool::Id>& type() const {
    return static_cast<const ColumnType::type&>(columns()[ColumnIndex::type]);
  }
  const TypedColumn<StringPool::Id>& name() const {
    return static_cast<const ColumnType::name&>(columns()[ColumnIndex::name]);
  }
  const TypedColumn<std::optional<CpuTrackTable::Id>>& parent_id() const {
    return static_cast<const ColumnType::parent_id&>(columns()[ColumnIndex::parent_id]);
  }
  const TypedColumn<std::optional<uint32_t>>& source_arg_set_id() const {
    return static_cast<const ColumnType::source_arg_set_id&>(columns()[ColumnIndex::source_arg_set_id]);
  }
  const TypedColumn<std::optional<MachineTable::Id>>& machine_id() const {
    return static_cast<const ColumnType::machine_id&>(columns()[ColumnIndex::machine_id]);
  }
  const TypedColumn<StringPool::Id>& classification() const {
    return static_cast<const ColumnType::classification&>(columns()[ColumnIndex::classification]);
  }
  const TypedColumn<std::optional<uint32_t>>& dimension_arg_set_id() const {
    return static_cast<const ColumnType::dimension_arg_set_id&>(columns()[ColumnIndex::dimension_arg_set_id]);
  }
  const TypedColumn<StringPool::Id>& event_type() const {
    return static_cast<const ColumnType::event_type&>(columns()[ColumnIndex::event_type]);
  }
  const TypedColumn<std::optional<StringPool::Id>>& counter_unit() const {
    return static_cast<const ColumnType::counter_unit&>(columns()[ColumnIndex::counter_unit]);
  }
  const TypedColumn<uint32_t>& cpu() const {
    return static_cast<const ColumnType::cpu&>(columns()[ColumnIndex::cpu]);
  }

  TypedColumn<StringPool::Id>* mutable_name() {
    return static_cast<ColumnType::name*>(
        GetColumn(ColumnIndex::name));
  }
  TypedColumn<std::optional<CpuTrackTable::Id>>* mutable_parent_id() {
    return static_cast<ColumnType::parent_id*>(
        GetColumn(ColumnIndex::parent_id));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_source_arg_set_id() {
    return static_cast<ColumnType::source_arg_set_id*>(
        GetColumn(ColumnIndex::source_arg_set_id));
  }
  TypedColumn<std::optional<MachineTable::Id>>* mutable_machine_id() {
    return static_cast<ColumnType::machine_id*>(
        GetColumn(ColumnIndex::machine_id));
  }
  TypedColumn<StringPool::Id>* mutable_classification() {
    return static_cast<ColumnType::classification*>(
        GetColumn(ColumnIndex::classification));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_dimension_arg_set_id() {
    return static_cast<ColumnType::dimension_arg_set_id*>(
        GetColumn(ColumnIndex::dimension_arg_set_id));
  }
  TypedColumn<StringPool::Id>* mutable_event_type() {
    return static_cast<ColumnType::event_type*>(
        GetColumn(ColumnIndex::event_type));
  }
  TypedColumn<std::optional<StringPool::Id>>* mutable_counter_unit() {
    return static_cast<ColumnType::counter_unit*>(
        GetColumn(ColumnIndex::counter_unit));
  }
  TypedColumn<uint32_t>* mutable_cpu() {
    return static_cast<ColumnType::cpu*>(
        GetColumn(ColumnIndex::cpu));
  }

 private:
  CpuTrackTable(StringPool* pool,
            const TrackTable& parent,
            const RowMap& parent_overlay,
            ColumnStorage<ColumnType::cpu::stored_type> cpu)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, &parent),
          parent,
          parent_overlay),
          const_parent_(&parent)
,
        cpu_storage_layer_(
        new column::NumericStorage<ColumnType::cpu::non_optional_stored_type>(
          &cpu_.vector(),
          ColumnTypeHelper<ColumnType::cpu::stored_type>::ToColumnType(),
          false))
         {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::cpu::stored_type>(
          ColumnFlag::cpu),
        "Column type and flag combination is not valid");
    PERFETTO_DCHECK(cpu.size() == parent_overlay.size());
    cpu_ = std::move(cpu);

    std::vector<RefPtr<column::OverlayLayer>> overlay_layers(OverlayCount(&parent) + 1);
    for (uint32_t i = 0; i < overlay_layers.size(); ++i) {
      if (overlays()[i].row_map().IsIndexVector()) {
        overlay_layers[i].reset(new column::ArrangementOverlay(
            overlays()[i].row_map().GetIfIndexVector(),
            column::DataLayerChain::Indices::State::kNonmonotonic));
      } else if (overlays()[i].row_map().IsBitVector()) {
        overlay_layers[i].reset(new column::SelectorOverlay(
            overlays()[i].row_map().GetIfBitVector()));
      } else if (overlays()[i].row_map().IsRange()) {
        overlay_layers[i].reset(new column::RangeOverlay(
            overlays()[i].row_map().GetIfIRange()));
      }
    }

    OnConstructionCompleted(
      {const_parent_->storage_layers()[ColumnIndex::id],const_parent_->storage_layers()[ColumnIndex::type],const_parent_->storage_layers()[ColumnIndex::name],const_parent_->storage_layers()[ColumnIndex::parent_id],const_parent_->storage_layers()[ColumnIndex::source_arg_set_id],const_parent_->storage_layers()[ColumnIndex::machine_id],const_parent_->storage_layers()[ColumnIndex::classification],const_parent_->storage_layers()[ColumnIndex::dimension_arg_set_id],const_parent_->storage_layers()[ColumnIndex::event_type],const_parent_->storage_layers()[ColumnIndex::counter_unit],cpu_storage_layer_}, {{},{},{},const_parent_->null_layers()[ColumnIndex::parent_id],const_parent_->null_layers()[ColumnIndex::source_arg_set_id],const_parent_->null_layers()[ColumnIndex::machine_id],{},const_parent_->null_layers()[ColumnIndex::dimension_arg_set_id],{},{},{}}, std::move(overlay_layers));
  }
  TrackTable* parent_ = nullptr;
  const TrackTable* const_parent_ = nullptr;
  ColumnStorage<ColumnType::cpu::stored_type> cpu_;

  RefPtr<column::StorageLayer> cpu_storage_layer_;

  
};
  

class GpuTrackTable : public macros_internal::MacroTable {
 public:
  static constexpr uint32_t kColumnCount = 13;

  using Id = TrackTable::Id;
    
  struct ColumnIndex {
    static constexpr uint32_t id = 0;
    static constexpr uint32_t type = 1;
    static constexpr uint32_t name = 2;
    static constexpr uint32_t parent_id = 3;
    static constexpr uint32_t source_arg_set_id = 4;
    static constexpr uint32_t machine_id = 5;
    static constexpr uint32_t classification = 6;
    static constexpr uint32_t dimension_arg_set_id = 7;
    static constexpr uint32_t event_type = 8;
    static constexpr uint32_t counter_unit = 9;
    static constexpr uint32_t scope = 10;
    static constexpr uint32_t description = 11;
    static constexpr uint32_t context_id = 12;
  };
  struct ColumnType {
    using id = IdColumn<GpuTrackTable::Id>;
    using type = TypedColumn<StringPool::Id>;
    using name = TypedColumn<StringPool::Id>;
    using parent_id = TypedColumn<std::optional<GpuTrackTable::Id>>;
    using source_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using machine_id = TypedColumn<std::optional<MachineTable::Id>>;
    using classification = TypedColumn<StringPool::Id>;
    using dimension_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using event_type = TypedColumn<StringPool::Id>;
    using counter_unit = TypedColumn<std::optional<StringPool::Id>>;
    using scope = TypedColumn<StringPool::Id>;
    using description = TypedColumn<StringPool::Id>;
    using context_id = TypedColumn<std::optional<int64_t>>;
  };
  struct Row : public TrackTable::Row {
    Row(StringPool::Id in_name = {},
        std::optional<GpuTrackTable::Id> in_parent_id = {},
        std::optional<uint32_t> in_source_arg_set_id = {},
        std::optional<MachineTable::Id> in_machine_id = {},
        StringPool::Id in_classification = {},
        std::optional<uint32_t> in_dimension_arg_set_id = {},
        StringPool::Id in_event_type = {},
        std::optional<StringPool::Id> in_counter_unit = {},
        StringPool::Id in_scope = {},
        StringPool::Id in_description = {},
        std::optional<int64_t> in_context_id = {},
        std::nullptr_t = nullptr)
        : TrackTable::Row(in_name, in_parent_id, in_source_arg_set_id, in_machine_id, in_classification, in_dimension_arg_set_id, in_event_type, in_counter_unit),
          scope(in_scope),
          description(in_description),
          context_id(in_context_id) {
      type_ = "gpu_track";
    }
    StringPool::Id scope;
    StringPool::Id description;
    std::optional<int64_t> context_id;

    bool operator==(const GpuTrackTable::Row& other) const {
      return type() == other.type() && ColumnType::name::Equals(name, other.name) &&
       ColumnType::parent_id::Equals(parent_id, other.parent_id) &&
       ColumnType::source_arg_set_id::Equals(source_arg_set_id, other.source_arg_set_id) &&
       ColumnType::machine_id::Equals(machine_id, other.machine_id) &&
       ColumnType::classification::Equals(classification, other.classification) &&
       ColumnType::dimension_arg_set_id::Equals(dimension_arg_set_id, other.dimension_arg_set_id) &&
       ColumnType::event_type::Equals(event_type, other.event_type) &&
       ColumnType::counter_unit::Equals(counter_unit, other.counter_unit) &&
       ColumnType::scope::Equals(scope, other.scope) &&
       ColumnType::description::Equals(description, other.description) &&
       ColumnType::context_id::Equals(context_id, other.context_id);
    }
  };
  struct ColumnFlag {
    static constexpr uint32_t scope = ColumnType::scope::default_flags();
    static constexpr uint32_t description = ColumnType::description::default_flags();
    static constexpr uint32_t context_id = ColumnType::context_id::default_flags();
  };

  class RowNumber;
  class ConstRowReference;
  class RowReference;

  class RowNumber : public macros_internal::AbstractRowNumber<
      GpuTrackTable, ConstRowReference, RowReference> {
   public:
    explicit RowNumber(uint32_t row_number)
        : AbstractRowNumber(row_number) {}
  };
  static_assert(std::is_trivially_destructible_v<RowNumber>,
                "Inheritance used without trivial destruction");

  class ConstRowReference : public macros_internal::AbstractConstRowReference<
    GpuTrackTable, RowNumber> {
   public:
    ConstRowReference(const GpuTrackTable* table, uint32_t row_number)
        : AbstractConstRowReference(table, row_number) {}

    ColumnType::id::type id() const {
      return table()->id()[row_number_];
    }
    ColumnType::type::type type() const {
      return table()->type()[row_number_];
    }
    ColumnType::name::type name() const {
      return table()->name()[row_number_];
    }
    ColumnType::parent_id::type parent_id() const {
      return table()->parent_id()[row_number_];
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      return table()->source_arg_set_id()[row_number_];
    }
    ColumnType::machine_id::type machine_id() const {
      return table()->machine_id()[row_number_];
    }
    ColumnType::classification::type classification() const {
      return table()->classification()[row_number_];
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      return table()->dimension_arg_set_id()[row_number_];
    }
    ColumnType::event_type::type event_type() const {
      return table()->event_type()[row_number_];
    }
    ColumnType::counter_unit::type counter_unit() const {
      return table()->counter_unit()[row_number_];
    }
    ColumnType::scope::type scope() const {
      return table()->scope()[row_number_];
    }
    ColumnType::description::type description() const {
      return table()->description()[row_number_];
    }
    ColumnType::context_id::type context_id() const {
      return table()->context_id()[row_number_];
    }
  };
  static_assert(std::is_trivially_destructible_v<ConstRowReference>,
                "Inheritance used without trivial destruction");
  class RowReference : public ConstRowReference {
   public:
    RowReference(const GpuTrackTable* table, uint32_t row_number)
        : ConstRowReference(table, row_number) {}

    void set_name(
        ColumnType::name::non_optional_type v) {
      return mutable_table()->mutable_name()->Set(row_number_, v);
    }
    void set_parent_id(
        ColumnType::parent_id::non_optional_type v) {
      return mutable_table()->mutable_parent_id()->Set(row_number_, v);
    }
    void set_source_arg_set_id(
        ColumnType::source_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_source_arg_set_id()->Set(row_number_, v);
    }
    void set_machine_id(
        ColumnType::machine_id::non_optional_type v) {
      return mutable_table()->mutable_machine_id()->Set(row_number_, v);
    }
    void set_classification(
        ColumnType::classification::non_optional_type v) {
      return mutable_table()->mutable_classification()->Set(row_number_, v);
    }
    void set_dimension_arg_set_id(
        ColumnType::dimension_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_dimension_arg_set_id()->Set(row_number_, v);
    }
    void set_event_type(
        ColumnType::event_type::non_optional_type v) {
      return mutable_table()->mutable_event_type()->Set(row_number_, v);
    }
    void set_counter_unit(
        ColumnType::counter_unit::non_optional_type v) {
      return mutable_table()->mutable_counter_unit()->Set(row_number_, v);
    }
    void set_scope(
        ColumnType::scope::non_optional_type v) {
      return mutable_table()->mutable_scope()->Set(row_number_, v);
    }
    void set_description(
        ColumnType::description::non_optional_type v) {
      return mutable_table()->mutable_description()->Set(row_number_, v);
    }
    void set_context_id(
        ColumnType::context_id::non_optional_type v) {
      return mutable_table()->mutable_context_id()->Set(row_number_, v);
    }

   private:
    GpuTrackTable* mutable_table() const {
      return const_cast<GpuTrackTable*>(table());
    }
  };
  static_assert(std::is_trivially_destructible_v<RowReference>,
                "Inheritance used without trivial destruction");

  class ConstIterator;
  class ConstIterator : public macros_internal::AbstractConstIterator<
    ConstIterator, GpuTrackTable, RowNumber, ConstRowReference> {
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
    ColumnType::name::type name() const {
      const auto& col = table()->name();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::parent_id::type parent_id() const {
      const auto& col = table()->parent_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      const auto& col = table()->source_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::machine_id::type machine_id() const {
      const auto& col = table()->machine_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::classification::type classification() const {
      const auto& col = table()->classification();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      const auto& col = table()->dimension_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::event_type::type event_type() const {
      const auto& col = table()->event_type();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::counter_unit::type counter_unit() const {
      const auto& col = table()->counter_unit();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::scope::type scope() const {
      const auto& col = table()->scope();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::description::type description() const {
      const auto& col = table()->description();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::context_id::type context_id() const {
      const auto& col = table()->context_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }

   protected:
    explicit ConstIterator(const GpuTrackTable* table,
                           Table::Iterator iterator)
        : AbstractConstIterator(table, std::move(iterator)) {}

    uint32_t CurrentRowNumber() const {
      return iterator_.StorageIndexForLastOverlay();
    }

   private:
    friend class GpuTrackTable;
    friend class macros_internal::AbstractConstIterator<
      ConstIterator, GpuTrackTable, RowNumber, ConstRowReference>;
  };
  class Iterator : public ConstIterator {
    public:
     RowReference row_reference() const {
       return {const_cast<GpuTrackTable*>(table()), CurrentRowNumber()};
     }

    private:
     friend class GpuTrackTable;

     explicit Iterator(GpuTrackTable* table, Table::Iterator iterator)
        : ConstIterator(table, std::move(iterator)) {}
  };

  struct IdAndRow {
    Id id;
    uint32_t row;
    RowReference row_reference;
    RowNumber row_number;
  };

  static std::vector<ColumnLegacy> GetColumns(
      GpuTrackTable* self,
      const macros_internal::MacroTable* parent) {
    std::vector<ColumnLegacy> columns =
        CopyColumnsFromParentOrAddRootColumns(self, parent);
    uint32_t olay_idx = OverlayCount(parent);
    AddColumnToVector(columns, "scope", &self->scope_, ColumnFlag::scope,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "description", &self->description_, ColumnFlag::description,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    AddColumnToVector(columns, "context_id", &self->context_id_, ColumnFlag::context_id,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    return columns;
  }

  PERFETTO_NO_INLINE explicit GpuTrackTable(StringPool* pool, TrackTable* parent)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, parent),
          parent),
        parent_(parent), const_parent_(parent), scope_(ColumnStorage<ColumnType::scope::stored_type>::Create<false>()),
        description_(ColumnStorage<ColumnType::description::stored_type>::Create<false>()),
        context_id_(ColumnStorage<ColumnType::context_id::stored_type>::Create<false>())
,
        scope_storage_layer_(
          new column::StringStorage(string_pool(), &scope_.vector())),
        description_storage_layer_(
          new column::StringStorage(string_pool(), &description_.vector())),
        context_id_storage_layer_(
          new column::NumericStorage<ColumnType::context_id::non_optional_stored_type>(
            &context_id_.non_null_vector(),
            ColumnTypeHelper<ColumnType::context_id::stored_type>::ToColumnType(),
            false))
,
        context_id_null_layer_(new column::NullOverlay(context_id_.bv())) {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::scope::stored_type>(
          ColumnFlag::scope),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::description::stored_type>(
          ColumnFlag::description),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::context_id::stored_type>(
          ColumnFlag::context_id),
        "Column type and flag combination is not valid");
    OnConstructionCompletedRegularConstructor(
      {const_parent_->storage_layers()[ColumnIndex::id],const_parent_->storage_layers()[ColumnIndex::type],const_parent_->storage_layers()[ColumnIndex::name],const_parent_->storage_layers()[ColumnIndex::parent_id],const_parent_->storage_layers()[ColumnIndex::source_arg_set_id],const_parent_->storage_layers()[ColumnIndex::machine_id],const_parent_->storage_layers()[ColumnIndex::classification],const_parent_->storage_layers()[ColumnIndex::dimension_arg_set_id],const_parent_->storage_layers()[ColumnIndex::event_type],const_parent_->storage_layers()[ColumnIndex::counter_unit],scope_storage_layer_,description_storage_layer_,context_id_storage_layer_},
      {{},{},{},const_parent_->null_layers()[ColumnIndex::parent_id],const_parent_->null_layers()[ColumnIndex::source_arg_set_id],const_parent_->null_layers()[ColumnIndex::machine_id],{},const_parent_->null_layers()[ColumnIndex::dimension_arg_set_id],{},{},{},{},context_id_null_layer_});
  }
  ~GpuTrackTable() override;

  static const char* Name() { return "gpu_track"; }

  static Table::Schema ComputeStaticSchema() {
    Table::Schema schema;
    schema.columns.emplace_back(Table::Schema::Column{
        "id", SqlValue::Type::kLong, true, true, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "type", SqlValue::Type::kString, false, false, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "name", ColumnType::name::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "parent_id", ColumnType::parent_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "source_arg_set_id", ColumnType::source_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "machine_id", ColumnType::machine_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "classification", ColumnType::classification::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "dimension_arg_set_id", ColumnType::dimension_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "event_type", ColumnType::event_type::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "counter_unit", ColumnType::counter_unit::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "scope", ColumnType::scope::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "description", ColumnType::description::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "context_id", ColumnType::context_id::SqlValueType(), false,
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
    scope_.ShrinkToFit();
    description_.ShrinkToFit();
    context_id_.ShrinkToFit();
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
    Id id = Id{parent_->Insert(row).id};
    UpdateOverlaysAfterParentInsert();
    mutable_scope()->Append(row.scope);
    mutable_description()->Append(row.description);
    mutable_context_id()->Append(row.context_id);
    UpdateSelfOverlayAfterInsert();
    return IdAndRow{id, row_number, RowReference(this, row_number),
                     RowNumber(row_number)};
  }

  static std::unique_ptr<GpuTrackTable> ExtendParent(
      const TrackTable& parent,
      ColumnStorage<ColumnType::scope::stored_type> scope
, ColumnStorage<ColumnType::description::stored_type> description
, ColumnStorage<ColumnType::context_id::stored_type> context_id) {
    return std::unique_ptr<GpuTrackTable>(new GpuTrackTable(
        parent.string_pool(), parent, RowMap(0, parent.row_count()),
        std::move(scope), std::move(description), std::move(context_id)));
  }

  static std::unique_ptr<GpuTrackTable> SelectAndExtendParent(
      const TrackTable& parent,
      std::vector<TrackTable::RowNumber> parent_overlay,
      ColumnStorage<ColumnType::scope::stored_type> scope
, ColumnStorage<ColumnType::description::stored_type> description
, ColumnStorage<ColumnType::context_id::stored_type> context_id) {
    std::vector<uint32_t> prs_untyped(parent_overlay.size());
    for (uint32_t i = 0; i < parent_overlay.size(); ++i) {
      prs_untyped[i] = parent_overlay[i].row_number();
    }
    return std::unique_ptr<GpuTrackTable>(new GpuTrackTable(
        parent.string_pool(), parent, RowMap(std::move(prs_untyped)),
        std::move(scope), std::move(description), std::move(context_id)));
  }

  const IdColumn<GpuTrackTable::Id>& id() const {
    return static_cast<const ColumnType::id&>(columns()[ColumnIndex::id]);
  }
  const TypedColumn<StringPool::Id>& type() const {
    return static_cast<const ColumnType::type&>(columns()[ColumnIndex::type]);
  }
  const TypedColumn<StringPool::Id>& name() const {
    return static_cast<const ColumnType::name&>(columns()[ColumnIndex::name]);
  }
  const TypedColumn<std::optional<GpuTrackTable::Id>>& parent_id() const {
    return static_cast<const ColumnType::parent_id&>(columns()[ColumnIndex::parent_id]);
  }
  const TypedColumn<std::optional<uint32_t>>& source_arg_set_id() const {
    return static_cast<const ColumnType::source_arg_set_id&>(columns()[ColumnIndex::source_arg_set_id]);
  }
  const TypedColumn<std::optional<MachineTable::Id>>& machine_id() const {
    return static_cast<const ColumnType::machine_id&>(columns()[ColumnIndex::machine_id]);
  }
  const TypedColumn<StringPool::Id>& classification() const {
    return static_cast<const ColumnType::classification&>(columns()[ColumnIndex::classification]);
  }
  const TypedColumn<std::optional<uint32_t>>& dimension_arg_set_id() const {
    return static_cast<const ColumnType::dimension_arg_set_id&>(columns()[ColumnIndex::dimension_arg_set_id]);
  }
  const TypedColumn<StringPool::Id>& event_type() const {
    return static_cast<const ColumnType::event_type&>(columns()[ColumnIndex::event_type]);
  }
  const TypedColumn<std::optional<StringPool::Id>>& counter_unit() const {
    return static_cast<const ColumnType::counter_unit&>(columns()[ColumnIndex::counter_unit]);
  }
  const TypedColumn<StringPool::Id>& scope() const {
    return static_cast<const ColumnType::scope&>(columns()[ColumnIndex::scope]);
  }
  const TypedColumn<StringPool::Id>& description() const {
    return static_cast<const ColumnType::description&>(columns()[ColumnIndex::description]);
  }
  const TypedColumn<std::optional<int64_t>>& context_id() const {
    return static_cast<const ColumnType::context_id&>(columns()[ColumnIndex::context_id]);
  }

  TypedColumn<StringPool::Id>* mutable_name() {
    return static_cast<ColumnType::name*>(
        GetColumn(ColumnIndex::name));
  }
  TypedColumn<std::optional<GpuTrackTable::Id>>* mutable_parent_id() {
    return static_cast<ColumnType::parent_id*>(
        GetColumn(ColumnIndex::parent_id));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_source_arg_set_id() {
    return static_cast<ColumnType::source_arg_set_id*>(
        GetColumn(ColumnIndex::source_arg_set_id));
  }
  TypedColumn<std::optional<MachineTable::Id>>* mutable_machine_id() {
    return static_cast<ColumnType::machine_id*>(
        GetColumn(ColumnIndex::machine_id));
  }
  TypedColumn<StringPool::Id>* mutable_classification() {
    return static_cast<ColumnType::classification*>(
        GetColumn(ColumnIndex::classification));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_dimension_arg_set_id() {
    return static_cast<ColumnType::dimension_arg_set_id*>(
        GetColumn(ColumnIndex::dimension_arg_set_id));
  }
  TypedColumn<StringPool::Id>* mutable_event_type() {
    return static_cast<ColumnType::event_type*>(
        GetColumn(ColumnIndex::event_type));
  }
  TypedColumn<std::optional<StringPool::Id>>* mutable_counter_unit() {
    return static_cast<ColumnType::counter_unit*>(
        GetColumn(ColumnIndex::counter_unit));
  }
  TypedColumn<StringPool::Id>* mutable_scope() {
    return static_cast<ColumnType::scope*>(
        GetColumn(ColumnIndex::scope));
  }
  TypedColumn<StringPool::Id>* mutable_description() {
    return static_cast<ColumnType::description*>(
        GetColumn(ColumnIndex::description));
  }
  TypedColumn<std::optional<int64_t>>* mutable_context_id() {
    return static_cast<ColumnType::context_id*>(
        GetColumn(ColumnIndex::context_id));
  }

 private:
  GpuTrackTable(StringPool* pool,
            const TrackTable& parent,
            const RowMap& parent_overlay,
            ColumnStorage<ColumnType::scope::stored_type> scope
, ColumnStorage<ColumnType::description::stored_type> description
, ColumnStorage<ColumnType::context_id::stored_type> context_id)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, &parent),
          parent,
          parent_overlay),
          const_parent_(&parent)
,
        scope_storage_layer_(
          new column::StringStorage(string_pool(), &scope_.vector())),
        description_storage_layer_(
          new column::StringStorage(string_pool(), &description_.vector())),
        context_id_storage_layer_(
          new column::NumericStorage<ColumnType::context_id::non_optional_stored_type>(
            &context_id_.non_null_vector(),
            ColumnTypeHelper<ColumnType::context_id::stored_type>::ToColumnType(),
            false))
,
        context_id_null_layer_(new column::NullOverlay(context_id_.bv())) {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::scope::stored_type>(
          ColumnFlag::scope),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::description::stored_type>(
          ColumnFlag::description),
        "Column type and flag combination is not valid");
      static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::context_id::stored_type>(
          ColumnFlag::context_id),
        "Column type and flag combination is not valid");
    PERFETTO_DCHECK(scope.size() == parent_overlay.size());
    scope_ = std::move(scope);
    PERFETTO_DCHECK(description.size() == parent_overlay.size());
    description_ = std::move(description);
    PERFETTO_DCHECK(context_id.size() == parent_overlay.size());
    context_id_ = std::move(context_id);

    std::vector<RefPtr<column::OverlayLayer>> overlay_layers(OverlayCount(&parent) + 1);
    for (uint32_t i = 0; i < overlay_layers.size(); ++i) {
      if (overlays()[i].row_map().IsIndexVector()) {
        overlay_layers[i].reset(new column::ArrangementOverlay(
            overlays()[i].row_map().GetIfIndexVector(),
            column::DataLayerChain::Indices::State::kNonmonotonic));
      } else if (overlays()[i].row_map().IsBitVector()) {
        overlay_layers[i].reset(new column::SelectorOverlay(
            overlays()[i].row_map().GetIfBitVector()));
      } else if (overlays()[i].row_map().IsRange()) {
        overlay_layers[i].reset(new column::RangeOverlay(
            overlays()[i].row_map().GetIfIRange()));
      }
    }

    OnConstructionCompleted(
      {const_parent_->storage_layers()[ColumnIndex::id],const_parent_->storage_layers()[ColumnIndex::type],const_parent_->storage_layers()[ColumnIndex::name],const_parent_->storage_layers()[ColumnIndex::parent_id],const_parent_->storage_layers()[ColumnIndex::source_arg_set_id],const_parent_->storage_layers()[ColumnIndex::machine_id],const_parent_->storage_layers()[ColumnIndex::classification],const_parent_->storage_layers()[ColumnIndex::dimension_arg_set_id],const_parent_->storage_layers()[ColumnIndex::event_type],const_parent_->storage_layers()[ColumnIndex::counter_unit],scope_storage_layer_,description_storage_layer_,context_id_storage_layer_}, {{},{},{},const_parent_->null_layers()[ColumnIndex::parent_id],const_parent_->null_layers()[ColumnIndex::source_arg_set_id],const_parent_->null_layers()[ColumnIndex::machine_id],{},const_parent_->null_layers()[ColumnIndex::dimension_arg_set_id],{},{},{},{},context_id_null_layer_}, std::move(overlay_layers));
  }
  TrackTable* parent_ = nullptr;
  const TrackTable* const_parent_ = nullptr;
  ColumnStorage<ColumnType::scope::stored_type> scope_;
  ColumnStorage<ColumnType::description::stored_type> description_;
  ColumnStorage<ColumnType::context_id::stored_type> context_id_;

  RefPtr<column::StorageLayer> scope_storage_layer_;
  RefPtr<column::StorageLayer> description_storage_layer_;
  RefPtr<column::StorageLayer> context_id_storage_layer_;

  RefPtr<column::OverlayLayer> context_id_null_layer_;
};
  

class ProcessTrackTable : public macros_internal::MacroTable {
 public:
  static constexpr uint32_t kColumnCount = 11;

  using Id = TrackTable::Id;
    
  struct ColumnIndex {
    static constexpr uint32_t id = 0;
    static constexpr uint32_t type = 1;
    static constexpr uint32_t name = 2;
    static constexpr uint32_t parent_id = 3;
    static constexpr uint32_t source_arg_set_id = 4;
    static constexpr uint32_t machine_id = 5;
    static constexpr uint32_t classification = 6;
    static constexpr uint32_t dimension_arg_set_id = 7;
    static constexpr uint32_t event_type = 8;
    static constexpr uint32_t counter_unit = 9;
    static constexpr uint32_t upid = 10;
  };
  struct ColumnType {
    using id = IdColumn<ProcessTrackTable::Id>;
    using type = TypedColumn<StringPool::Id>;
    using name = TypedColumn<StringPool::Id>;
    using parent_id = TypedColumn<std::optional<ProcessTrackTable::Id>>;
    using source_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using machine_id = TypedColumn<std::optional<MachineTable::Id>>;
    using classification = TypedColumn<StringPool::Id>;
    using dimension_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using event_type = TypedColumn<StringPool::Id>;
    using counter_unit = TypedColumn<std::optional<StringPool::Id>>;
    using upid = TypedColumn<uint32_t>;
  };
  struct Row : public TrackTable::Row {
    Row(StringPool::Id in_name = {},
        std::optional<ProcessTrackTable::Id> in_parent_id = {},
        std::optional<uint32_t> in_source_arg_set_id = {},
        std::optional<MachineTable::Id> in_machine_id = {},
        StringPool::Id in_classification = {},
        std::optional<uint32_t> in_dimension_arg_set_id = {},
        StringPool::Id in_event_type = {},
        std::optional<StringPool::Id> in_counter_unit = {},
        uint32_t in_upid = {},
        std::nullptr_t = nullptr)
        : TrackTable::Row(in_name, in_parent_id, in_source_arg_set_id, in_machine_id, in_classification, in_dimension_arg_set_id, in_event_type, in_counter_unit),
          upid(in_upid) {
      type_ = "process_track";
    }
    uint32_t upid;

    bool operator==(const ProcessTrackTable::Row& other) const {
      return type() == other.type() && ColumnType::name::Equals(name, other.name) &&
       ColumnType::parent_id::Equals(parent_id, other.parent_id) &&
       ColumnType::source_arg_set_id::Equals(source_arg_set_id, other.source_arg_set_id) &&
       ColumnType::machine_id::Equals(machine_id, other.machine_id) &&
       ColumnType::classification::Equals(classification, other.classification) &&
       ColumnType::dimension_arg_set_id::Equals(dimension_arg_set_id, other.dimension_arg_set_id) &&
       ColumnType::event_type::Equals(event_type, other.event_type) &&
       ColumnType::counter_unit::Equals(counter_unit, other.counter_unit) &&
       ColumnType::upid::Equals(upid, other.upid);
    }
  };
  struct ColumnFlag {
    static constexpr uint32_t upid = ColumnType::upid::default_flags();
  };

  class RowNumber;
  class ConstRowReference;
  class RowReference;

  class RowNumber : public macros_internal::AbstractRowNumber<
      ProcessTrackTable, ConstRowReference, RowReference> {
   public:
    explicit RowNumber(uint32_t row_number)
        : AbstractRowNumber(row_number) {}
  };
  static_assert(std::is_trivially_destructible_v<RowNumber>,
                "Inheritance used without trivial destruction");

  class ConstRowReference : public macros_internal::AbstractConstRowReference<
    ProcessTrackTable, RowNumber> {
   public:
    ConstRowReference(const ProcessTrackTable* table, uint32_t row_number)
        : AbstractConstRowReference(table, row_number) {}

    ColumnType::id::type id() const {
      return table()->id()[row_number_];
    }
    ColumnType::type::type type() const {
      return table()->type()[row_number_];
    }
    ColumnType::name::type name() const {
      return table()->name()[row_number_];
    }
    ColumnType::parent_id::type parent_id() const {
      return table()->parent_id()[row_number_];
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      return table()->source_arg_set_id()[row_number_];
    }
    ColumnType::machine_id::type machine_id() const {
      return table()->machine_id()[row_number_];
    }
    ColumnType::classification::type classification() const {
      return table()->classification()[row_number_];
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      return table()->dimension_arg_set_id()[row_number_];
    }
    ColumnType::event_type::type event_type() const {
      return table()->event_type()[row_number_];
    }
    ColumnType::counter_unit::type counter_unit() const {
      return table()->counter_unit()[row_number_];
    }
    ColumnType::upid::type upid() const {
      return table()->upid()[row_number_];
    }
  };
  static_assert(std::is_trivially_destructible_v<ConstRowReference>,
                "Inheritance used without trivial destruction");
  class RowReference : public ConstRowReference {
   public:
    RowReference(const ProcessTrackTable* table, uint32_t row_number)
        : ConstRowReference(table, row_number) {}

    void set_name(
        ColumnType::name::non_optional_type v) {
      return mutable_table()->mutable_name()->Set(row_number_, v);
    }
    void set_parent_id(
        ColumnType::parent_id::non_optional_type v) {
      return mutable_table()->mutable_parent_id()->Set(row_number_, v);
    }
    void set_source_arg_set_id(
        ColumnType::source_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_source_arg_set_id()->Set(row_number_, v);
    }
    void set_machine_id(
        ColumnType::machine_id::non_optional_type v) {
      return mutable_table()->mutable_machine_id()->Set(row_number_, v);
    }
    void set_classification(
        ColumnType::classification::non_optional_type v) {
      return mutable_table()->mutable_classification()->Set(row_number_, v);
    }
    void set_dimension_arg_set_id(
        ColumnType::dimension_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_dimension_arg_set_id()->Set(row_number_, v);
    }
    void set_event_type(
        ColumnType::event_type::non_optional_type v) {
      return mutable_table()->mutable_event_type()->Set(row_number_, v);
    }
    void set_counter_unit(
        ColumnType::counter_unit::non_optional_type v) {
      return mutable_table()->mutable_counter_unit()->Set(row_number_, v);
    }
    void set_upid(
        ColumnType::upid::non_optional_type v) {
      return mutable_table()->mutable_upid()->Set(row_number_, v);
    }

   private:
    ProcessTrackTable* mutable_table() const {
      return const_cast<ProcessTrackTable*>(table());
    }
  };
  static_assert(std::is_trivially_destructible_v<RowReference>,
                "Inheritance used without trivial destruction");

  class ConstIterator;
  class ConstIterator : public macros_internal::AbstractConstIterator<
    ConstIterator, ProcessTrackTable, RowNumber, ConstRowReference> {
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
    ColumnType::name::type name() const {
      const auto& col = table()->name();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::parent_id::type parent_id() const {
      const auto& col = table()->parent_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      const auto& col = table()->source_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::machine_id::type machine_id() const {
      const auto& col = table()->machine_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::classification::type classification() const {
      const auto& col = table()->classification();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      const auto& col = table()->dimension_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::event_type::type event_type() const {
      const auto& col = table()->event_type();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::counter_unit::type counter_unit() const {
      const auto& col = table()->counter_unit();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::upid::type upid() const {
      const auto& col = table()->upid();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }

   protected:
    explicit ConstIterator(const ProcessTrackTable* table,
                           Table::Iterator iterator)
        : AbstractConstIterator(table, std::move(iterator)) {}

    uint32_t CurrentRowNumber() const {
      return iterator_.StorageIndexForLastOverlay();
    }

   private:
    friend class ProcessTrackTable;
    friend class macros_internal::AbstractConstIterator<
      ConstIterator, ProcessTrackTable, RowNumber, ConstRowReference>;
  };
  class Iterator : public ConstIterator {
    public:
     RowReference row_reference() const {
       return {const_cast<ProcessTrackTable*>(table()), CurrentRowNumber()};
     }

    private:
     friend class ProcessTrackTable;

     explicit Iterator(ProcessTrackTable* table, Table::Iterator iterator)
        : ConstIterator(table, std::move(iterator)) {}
  };

  struct IdAndRow {
    Id id;
    uint32_t row;
    RowReference row_reference;
    RowNumber row_number;
  };

  static std::vector<ColumnLegacy> GetColumns(
      ProcessTrackTable* self,
      const macros_internal::MacroTable* parent) {
    std::vector<ColumnLegacy> columns =
        CopyColumnsFromParentOrAddRootColumns(self, parent);
    uint32_t olay_idx = OverlayCount(parent);
    AddColumnToVector(columns, "upid", &self->upid_, ColumnFlag::upid,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    return columns;
  }

  PERFETTO_NO_INLINE explicit ProcessTrackTable(StringPool* pool, TrackTable* parent)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, parent),
          parent),
        parent_(parent), const_parent_(parent), upid_(ColumnStorage<ColumnType::upid::stored_type>::Create<false>())
,
        upid_storage_layer_(
        new column::NumericStorage<ColumnType::upid::non_optional_stored_type>(
          &upid_.vector(),
          ColumnTypeHelper<ColumnType::upid::stored_type>::ToColumnType(),
          false))
         {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::upid::stored_type>(
          ColumnFlag::upid),
        "Column type and flag combination is not valid");
    OnConstructionCompletedRegularConstructor(
      {const_parent_->storage_layers()[ColumnIndex::id],const_parent_->storage_layers()[ColumnIndex::type],const_parent_->storage_layers()[ColumnIndex::name],const_parent_->storage_layers()[ColumnIndex::parent_id],const_parent_->storage_layers()[ColumnIndex::source_arg_set_id],const_parent_->storage_layers()[ColumnIndex::machine_id],const_parent_->storage_layers()[ColumnIndex::classification],const_parent_->storage_layers()[ColumnIndex::dimension_arg_set_id],const_parent_->storage_layers()[ColumnIndex::event_type],const_parent_->storage_layers()[ColumnIndex::counter_unit],upid_storage_layer_},
      {{},{},{},const_parent_->null_layers()[ColumnIndex::parent_id],const_parent_->null_layers()[ColumnIndex::source_arg_set_id],const_parent_->null_layers()[ColumnIndex::machine_id],{},const_parent_->null_layers()[ColumnIndex::dimension_arg_set_id],{},{},{}});
  }
  ~ProcessTrackTable() override;

  static const char* Name() { return "process_track"; }

  static Table::Schema ComputeStaticSchema() {
    Table::Schema schema;
    schema.columns.emplace_back(Table::Schema::Column{
        "id", SqlValue::Type::kLong, true, true, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "type", SqlValue::Type::kString, false, false, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "name", ColumnType::name::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "parent_id", ColumnType::parent_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "source_arg_set_id", ColumnType::source_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "machine_id", ColumnType::machine_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "classification", ColumnType::classification::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "dimension_arg_set_id", ColumnType::dimension_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "event_type", ColumnType::event_type::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "counter_unit", ColumnType::counter_unit::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "upid", ColumnType::upid::SqlValueType(), false,
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
    upid_.ShrinkToFit();
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
    Id id = Id{parent_->Insert(row).id};
    UpdateOverlaysAfterParentInsert();
    mutable_upid()->Append(row.upid);
    UpdateSelfOverlayAfterInsert();
    return IdAndRow{id, row_number, RowReference(this, row_number),
                     RowNumber(row_number)};
  }

  static std::unique_ptr<ProcessTrackTable> ExtendParent(
      const TrackTable& parent,
      ColumnStorage<ColumnType::upid::stored_type> upid) {
    return std::unique_ptr<ProcessTrackTable>(new ProcessTrackTable(
        parent.string_pool(), parent, RowMap(0, parent.row_count()),
        std::move(upid)));
  }

  static std::unique_ptr<ProcessTrackTable> SelectAndExtendParent(
      const TrackTable& parent,
      std::vector<TrackTable::RowNumber> parent_overlay,
      ColumnStorage<ColumnType::upid::stored_type> upid) {
    std::vector<uint32_t> prs_untyped(parent_overlay.size());
    for (uint32_t i = 0; i < parent_overlay.size(); ++i) {
      prs_untyped[i] = parent_overlay[i].row_number();
    }
    return std::unique_ptr<ProcessTrackTable>(new ProcessTrackTable(
        parent.string_pool(), parent, RowMap(std::move(prs_untyped)),
        std::move(upid)));
  }

  const IdColumn<ProcessTrackTable::Id>& id() const {
    return static_cast<const ColumnType::id&>(columns()[ColumnIndex::id]);
  }
  const TypedColumn<StringPool::Id>& type() const {
    return static_cast<const ColumnType::type&>(columns()[ColumnIndex::type]);
  }
  const TypedColumn<StringPool::Id>& name() const {
    return static_cast<const ColumnType::name&>(columns()[ColumnIndex::name]);
  }
  const TypedColumn<std::optional<ProcessTrackTable::Id>>& parent_id() const {
    return static_cast<const ColumnType::parent_id&>(columns()[ColumnIndex::parent_id]);
  }
  const TypedColumn<std::optional<uint32_t>>& source_arg_set_id() const {
    return static_cast<const ColumnType::source_arg_set_id&>(columns()[ColumnIndex::source_arg_set_id]);
  }
  const TypedColumn<std::optional<MachineTable::Id>>& machine_id() const {
    return static_cast<const ColumnType::machine_id&>(columns()[ColumnIndex::machine_id]);
  }
  const TypedColumn<StringPool::Id>& classification() const {
    return static_cast<const ColumnType::classification&>(columns()[ColumnIndex::classification]);
  }
  const TypedColumn<std::optional<uint32_t>>& dimension_arg_set_id() const {
    return static_cast<const ColumnType::dimension_arg_set_id&>(columns()[ColumnIndex::dimension_arg_set_id]);
  }
  const TypedColumn<StringPool::Id>& event_type() const {
    return static_cast<const ColumnType::event_type&>(columns()[ColumnIndex::event_type]);
  }
  const TypedColumn<std::optional<StringPool::Id>>& counter_unit() const {
    return static_cast<const ColumnType::counter_unit&>(columns()[ColumnIndex::counter_unit]);
  }
  const TypedColumn<uint32_t>& upid() const {
    return static_cast<const ColumnType::upid&>(columns()[ColumnIndex::upid]);
  }

  TypedColumn<StringPool::Id>* mutable_name() {
    return static_cast<ColumnType::name*>(
        GetColumn(ColumnIndex::name));
  }
  TypedColumn<std::optional<ProcessTrackTable::Id>>* mutable_parent_id() {
    return static_cast<ColumnType::parent_id*>(
        GetColumn(ColumnIndex::parent_id));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_source_arg_set_id() {
    return static_cast<ColumnType::source_arg_set_id*>(
        GetColumn(ColumnIndex::source_arg_set_id));
  }
  TypedColumn<std::optional<MachineTable::Id>>* mutable_machine_id() {
    return static_cast<ColumnType::machine_id*>(
        GetColumn(ColumnIndex::machine_id));
  }
  TypedColumn<StringPool::Id>* mutable_classification() {
    return static_cast<ColumnType::classification*>(
        GetColumn(ColumnIndex::classification));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_dimension_arg_set_id() {
    return static_cast<ColumnType::dimension_arg_set_id*>(
        GetColumn(ColumnIndex::dimension_arg_set_id));
  }
  TypedColumn<StringPool::Id>* mutable_event_type() {
    return static_cast<ColumnType::event_type*>(
        GetColumn(ColumnIndex::event_type));
  }
  TypedColumn<std::optional<StringPool::Id>>* mutable_counter_unit() {
    return static_cast<ColumnType::counter_unit*>(
        GetColumn(ColumnIndex::counter_unit));
  }
  TypedColumn<uint32_t>* mutable_upid() {
    return static_cast<ColumnType::upid*>(
        GetColumn(ColumnIndex::upid));
  }

 private:
  ProcessTrackTable(StringPool* pool,
            const TrackTable& parent,
            const RowMap& parent_overlay,
            ColumnStorage<ColumnType::upid::stored_type> upid)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, &parent),
          parent,
          parent_overlay),
          const_parent_(&parent)
,
        upid_storage_layer_(
        new column::NumericStorage<ColumnType::upid::non_optional_stored_type>(
          &upid_.vector(),
          ColumnTypeHelper<ColumnType::upid::stored_type>::ToColumnType(),
          false))
         {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::upid::stored_type>(
          ColumnFlag::upid),
        "Column type and flag combination is not valid");
    PERFETTO_DCHECK(upid.size() == parent_overlay.size());
    upid_ = std::move(upid);

    std::vector<RefPtr<column::OverlayLayer>> overlay_layers(OverlayCount(&parent) + 1);
    for (uint32_t i = 0; i < overlay_layers.size(); ++i) {
      if (overlays()[i].row_map().IsIndexVector()) {
        overlay_layers[i].reset(new column::ArrangementOverlay(
            overlays()[i].row_map().GetIfIndexVector(),
            column::DataLayerChain::Indices::State::kNonmonotonic));
      } else if (overlays()[i].row_map().IsBitVector()) {
        overlay_layers[i].reset(new column::SelectorOverlay(
            overlays()[i].row_map().GetIfBitVector()));
      } else if (overlays()[i].row_map().IsRange()) {
        overlay_layers[i].reset(new column::RangeOverlay(
            overlays()[i].row_map().GetIfIRange()));
      }
    }

    OnConstructionCompleted(
      {const_parent_->storage_layers()[ColumnIndex::id],const_parent_->storage_layers()[ColumnIndex::type],const_parent_->storage_layers()[ColumnIndex::name],const_parent_->storage_layers()[ColumnIndex::parent_id],const_parent_->storage_layers()[ColumnIndex::source_arg_set_id],const_parent_->storage_layers()[ColumnIndex::machine_id],const_parent_->storage_layers()[ColumnIndex::classification],const_parent_->storage_layers()[ColumnIndex::dimension_arg_set_id],const_parent_->storage_layers()[ColumnIndex::event_type],const_parent_->storage_layers()[ColumnIndex::counter_unit],upid_storage_layer_}, {{},{},{},const_parent_->null_layers()[ColumnIndex::parent_id],const_parent_->null_layers()[ColumnIndex::source_arg_set_id],const_parent_->null_layers()[ColumnIndex::machine_id],{},const_parent_->null_layers()[ColumnIndex::dimension_arg_set_id],{},{},{}}, std::move(overlay_layers));
  }
  TrackTable* parent_ = nullptr;
  const TrackTable* const_parent_ = nullptr;
  ColumnStorage<ColumnType::upid::stored_type> upid_;

  RefPtr<column::StorageLayer> upid_storage_layer_;

  
};
  

class ThreadTrackTable : public macros_internal::MacroTable {
 public:
  static constexpr uint32_t kColumnCount = 11;

  using Id = TrackTable::Id;
    
  struct ColumnIndex {
    static constexpr uint32_t id = 0;
    static constexpr uint32_t type = 1;
    static constexpr uint32_t name = 2;
    static constexpr uint32_t parent_id = 3;
    static constexpr uint32_t source_arg_set_id = 4;
    static constexpr uint32_t machine_id = 5;
    static constexpr uint32_t classification = 6;
    static constexpr uint32_t dimension_arg_set_id = 7;
    static constexpr uint32_t event_type = 8;
    static constexpr uint32_t counter_unit = 9;
    static constexpr uint32_t utid = 10;
  };
  struct ColumnType {
    using id = IdColumn<ThreadTrackTable::Id>;
    using type = TypedColumn<StringPool::Id>;
    using name = TypedColumn<StringPool::Id>;
    using parent_id = TypedColumn<std::optional<ThreadTrackTable::Id>>;
    using source_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using machine_id = TypedColumn<std::optional<MachineTable::Id>>;
    using classification = TypedColumn<StringPool::Id>;
    using dimension_arg_set_id = TypedColumn<std::optional<uint32_t>>;
    using event_type = TypedColumn<StringPool::Id>;
    using counter_unit = TypedColumn<std::optional<StringPool::Id>>;
    using utid = TypedColumn<uint32_t>;
  };
  struct Row : public TrackTable::Row {
    Row(StringPool::Id in_name = {},
        std::optional<ThreadTrackTable::Id> in_parent_id = {},
        std::optional<uint32_t> in_source_arg_set_id = {},
        std::optional<MachineTable::Id> in_machine_id = {},
        StringPool::Id in_classification = {},
        std::optional<uint32_t> in_dimension_arg_set_id = {},
        StringPool::Id in_event_type = {},
        std::optional<StringPool::Id> in_counter_unit = {},
        uint32_t in_utid = {},
        std::nullptr_t = nullptr)
        : TrackTable::Row(in_name, in_parent_id, in_source_arg_set_id, in_machine_id, in_classification, in_dimension_arg_set_id, in_event_type, in_counter_unit),
          utid(in_utid) {
      type_ = "thread_track";
    }
    uint32_t utid;

    bool operator==(const ThreadTrackTable::Row& other) const {
      return type() == other.type() && ColumnType::name::Equals(name, other.name) &&
       ColumnType::parent_id::Equals(parent_id, other.parent_id) &&
       ColumnType::source_arg_set_id::Equals(source_arg_set_id, other.source_arg_set_id) &&
       ColumnType::machine_id::Equals(machine_id, other.machine_id) &&
       ColumnType::classification::Equals(classification, other.classification) &&
       ColumnType::dimension_arg_set_id::Equals(dimension_arg_set_id, other.dimension_arg_set_id) &&
       ColumnType::event_type::Equals(event_type, other.event_type) &&
       ColumnType::counter_unit::Equals(counter_unit, other.counter_unit) &&
       ColumnType::utid::Equals(utid, other.utid);
    }
  };
  struct ColumnFlag {
    static constexpr uint32_t utid = ColumnType::utid::default_flags();
  };

  class RowNumber;
  class ConstRowReference;
  class RowReference;

  class RowNumber : public macros_internal::AbstractRowNumber<
      ThreadTrackTable, ConstRowReference, RowReference> {
   public:
    explicit RowNumber(uint32_t row_number)
        : AbstractRowNumber(row_number) {}
  };
  static_assert(std::is_trivially_destructible_v<RowNumber>,
                "Inheritance used without trivial destruction");

  class ConstRowReference : public macros_internal::AbstractConstRowReference<
    ThreadTrackTable, RowNumber> {
   public:
    ConstRowReference(const ThreadTrackTable* table, uint32_t row_number)
        : AbstractConstRowReference(table, row_number) {}

    ColumnType::id::type id() const {
      return table()->id()[row_number_];
    }
    ColumnType::type::type type() const {
      return table()->type()[row_number_];
    }
    ColumnType::name::type name() const {
      return table()->name()[row_number_];
    }
    ColumnType::parent_id::type parent_id() const {
      return table()->parent_id()[row_number_];
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      return table()->source_arg_set_id()[row_number_];
    }
    ColumnType::machine_id::type machine_id() const {
      return table()->machine_id()[row_number_];
    }
    ColumnType::classification::type classification() const {
      return table()->classification()[row_number_];
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      return table()->dimension_arg_set_id()[row_number_];
    }
    ColumnType::event_type::type event_type() const {
      return table()->event_type()[row_number_];
    }
    ColumnType::counter_unit::type counter_unit() const {
      return table()->counter_unit()[row_number_];
    }
    ColumnType::utid::type utid() const {
      return table()->utid()[row_number_];
    }
  };
  static_assert(std::is_trivially_destructible_v<ConstRowReference>,
                "Inheritance used without trivial destruction");
  class RowReference : public ConstRowReference {
   public:
    RowReference(const ThreadTrackTable* table, uint32_t row_number)
        : ConstRowReference(table, row_number) {}

    void set_name(
        ColumnType::name::non_optional_type v) {
      return mutable_table()->mutable_name()->Set(row_number_, v);
    }
    void set_parent_id(
        ColumnType::parent_id::non_optional_type v) {
      return mutable_table()->mutable_parent_id()->Set(row_number_, v);
    }
    void set_source_arg_set_id(
        ColumnType::source_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_source_arg_set_id()->Set(row_number_, v);
    }
    void set_machine_id(
        ColumnType::machine_id::non_optional_type v) {
      return mutable_table()->mutable_machine_id()->Set(row_number_, v);
    }
    void set_classification(
        ColumnType::classification::non_optional_type v) {
      return mutable_table()->mutable_classification()->Set(row_number_, v);
    }
    void set_dimension_arg_set_id(
        ColumnType::dimension_arg_set_id::non_optional_type v) {
      return mutable_table()->mutable_dimension_arg_set_id()->Set(row_number_, v);
    }
    void set_event_type(
        ColumnType::event_type::non_optional_type v) {
      return mutable_table()->mutable_event_type()->Set(row_number_, v);
    }
    void set_counter_unit(
        ColumnType::counter_unit::non_optional_type v) {
      return mutable_table()->mutable_counter_unit()->Set(row_number_, v);
    }
    void set_utid(
        ColumnType::utid::non_optional_type v) {
      return mutable_table()->mutable_utid()->Set(row_number_, v);
    }

   private:
    ThreadTrackTable* mutable_table() const {
      return const_cast<ThreadTrackTable*>(table());
    }
  };
  static_assert(std::is_trivially_destructible_v<RowReference>,
                "Inheritance used without trivial destruction");

  class ConstIterator;
  class ConstIterator : public macros_internal::AbstractConstIterator<
    ConstIterator, ThreadTrackTable, RowNumber, ConstRowReference> {
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
    ColumnType::name::type name() const {
      const auto& col = table()->name();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::parent_id::type parent_id() const {
      const auto& col = table()->parent_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::source_arg_set_id::type source_arg_set_id() const {
      const auto& col = table()->source_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::machine_id::type machine_id() const {
      const auto& col = table()->machine_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::classification::type classification() const {
      const auto& col = table()->classification();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::dimension_arg_set_id::type dimension_arg_set_id() const {
      const auto& col = table()->dimension_arg_set_id();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::event_type::type event_type() const {
      const auto& col = table()->event_type();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::counter_unit::type counter_unit() const {
      const auto& col = table()->counter_unit();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }
    ColumnType::utid::type utid() const {
      const auto& col = table()->utid();
      return col.GetAtIdx(
        iterator_.StorageIndexForColumn(col.index_in_table()));
    }

   protected:
    explicit ConstIterator(const ThreadTrackTable* table,
                           Table::Iterator iterator)
        : AbstractConstIterator(table, std::move(iterator)) {}

    uint32_t CurrentRowNumber() const {
      return iterator_.StorageIndexForLastOverlay();
    }

   private:
    friend class ThreadTrackTable;
    friend class macros_internal::AbstractConstIterator<
      ConstIterator, ThreadTrackTable, RowNumber, ConstRowReference>;
  };
  class Iterator : public ConstIterator {
    public:
     RowReference row_reference() const {
       return {const_cast<ThreadTrackTable*>(table()), CurrentRowNumber()};
     }

    private:
     friend class ThreadTrackTable;

     explicit Iterator(ThreadTrackTable* table, Table::Iterator iterator)
        : ConstIterator(table, std::move(iterator)) {}
  };

  struct IdAndRow {
    Id id;
    uint32_t row;
    RowReference row_reference;
    RowNumber row_number;
  };

  static std::vector<ColumnLegacy> GetColumns(
      ThreadTrackTable* self,
      const macros_internal::MacroTable* parent) {
    std::vector<ColumnLegacy> columns =
        CopyColumnsFromParentOrAddRootColumns(self, parent);
    uint32_t olay_idx = OverlayCount(parent);
    AddColumnToVector(columns, "utid", &self->utid_, ColumnFlag::utid,
                      static_cast<uint32_t>(columns.size()), olay_idx);
    return columns;
  }

  PERFETTO_NO_INLINE explicit ThreadTrackTable(StringPool* pool, TrackTable* parent)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, parent),
          parent),
        parent_(parent), const_parent_(parent), utid_(ColumnStorage<ColumnType::utid::stored_type>::Create<false>())
,
        utid_storage_layer_(
        new column::NumericStorage<ColumnType::utid::non_optional_stored_type>(
          &utid_.vector(),
          ColumnTypeHelper<ColumnType::utid::stored_type>::ToColumnType(),
          false))
         {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::utid::stored_type>(
          ColumnFlag::utid),
        "Column type and flag combination is not valid");
    OnConstructionCompletedRegularConstructor(
      {const_parent_->storage_layers()[ColumnIndex::id],const_parent_->storage_layers()[ColumnIndex::type],const_parent_->storage_layers()[ColumnIndex::name],const_parent_->storage_layers()[ColumnIndex::parent_id],const_parent_->storage_layers()[ColumnIndex::source_arg_set_id],const_parent_->storage_layers()[ColumnIndex::machine_id],const_parent_->storage_layers()[ColumnIndex::classification],const_parent_->storage_layers()[ColumnIndex::dimension_arg_set_id],const_parent_->storage_layers()[ColumnIndex::event_type],const_parent_->storage_layers()[ColumnIndex::counter_unit],utid_storage_layer_},
      {{},{},{},const_parent_->null_layers()[ColumnIndex::parent_id],const_parent_->null_layers()[ColumnIndex::source_arg_set_id],const_parent_->null_layers()[ColumnIndex::machine_id],{},const_parent_->null_layers()[ColumnIndex::dimension_arg_set_id],{},{},{}});
  }
  ~ThreadTrackTable() override;

  static const char* Name() { return "thread_track"; }

  static Table::Schema ComputeStaticSchema() {
    Table::Schema schema;
    schema.columns.emplace_back(Table::Schema::Column{
        "id", SqlValue::Type::kLong, true, true, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "type", SqlValue::Type::kString, false, false, false, false});
    schema.columns.emplace_back(Table::Schema::Column{
        "name", ColumnType::name::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "parent_id", ColumnType::parent_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "source_arg_set_id", ColumnType::source_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "machine_id", ColumnType::machine_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "classification", ColumnType::classification::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "dimension_arg_set_id", ColumnType::dimension_arg_set_id::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "event_type", ColumnType::event_type::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "counter_unit", ColumnType::counter_unit::SqlValueType(), false,
        false,
        false,
        false});
    schema.columns.emplace_back(Table::Schema::Column{
        "utid", ColumnType::utid::SqlValueType(), false,
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
    utid_.ShrinkToFit();
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
    Id id = Id{parent_->Insert(row).id};
    UpdateOverlaysAfterParentInsert();
    mutable_utid()->Append(row.utid);
    UpdateSelfOverlayAfterInsert();
    return IdAndRow{id, row_number, RowReference(this, row_number),
                     RowNumber(row_number)};
  }

  static std::unique_ptr<ThreadTrackTable> ExtendParent(
      const TrackTable& parent,
      ColumnStorage<ColumnType::utid::stored_type> utid) {
    return std::unique_ptr<ThreadTrackTable>(new ThreadTrackTable(
        parent.string_pool(), parent, RowMap(0, parent.row_count()),
        std::move(utid)));
  }

  static std::unique_ptr<ThreadTrackTable> SelectAndExtendParent(
      const TrackTable& parent,
      std::vector<TrackTable::RowNumber> parent_overlay,
      ColumnStorage<ColumnType::utid::stored_type> utid) {
    std::vector<uint32_t> prs_untyped(parent_overlay.size());
    for (uint32_t i = 0; i < parent_overlay.size(); ++i) {
      prs_untyped[i] = parent_overlay[i].row_number();
    }
    return std::unique_ptr<ThreadTrackTable>(new ThreadTrackTable(
        parent.string_pool(), parent, RowMap(std::move(prs_untyped)),
        std::move(utid)));
  }

  const IdColumn<ThreadTrackTable::Id>& id() const {
    return static_cast<const ColumnType::id&>(columns()[ColumnIndex::id]);
  }
  const TypedColumn<StringPool::Id>& type() const {
    return static_cast<const ColumnType::type&>(columns()[ColumnIndex::type]);
  }
  const TypedColumn<StringPool::Id>& name() const {
    return static_cast<const ColumnType::name&>(columns()[ColumnIndex::name]);
  }
  const TypedColumn<std::optional<ThreadTrackTable::Id>>& parent_id() const {
    return static_cast<const ColumnType::parent_id&>(columns()[ColumnIndex::parent_id]);
  }
  const TypedColumn<std::optional<uint32_t>>& source_arg_set_id() const {
    return static_cast<const ColumnType::source_arg_set_id&>(columns()[ColumnIndex::source_arg_set_id]);
  }
  const TypedColumn<std::optional<MachineTable::Id>>& machine_id() const {
    return static_cast<const ColumnType::machine_id&>(columns()[ColumnIndex::machine_id]);
  }
  const TypedColumn<StringPool::Id>& classification() const {
    return static_cast<const ColumnType::classification&>(columns()[ColumnIndex::classification]);
  }
  const TypedColumn<std::optional<uint32_t>>& dimension_arg_set_id() const {
    return static_cast<const ColumnType::dimension_arg_set_id&>(columns()[ColumnIndex::dimension_arg_set_id]);
  }
  const TypedColumn<StringPool::Id>& event_type() const {
    return static_cast<const ColumnType::event_type&>(columns()[ColumnIndex::event_type]);
  }
  const TypedColumn<std::optional<StringPool::Id>>& counter_unit() const {
    return static_cast<const ColumnType::counter_unit&>(columns()[ColumnIndex::counter_unit]);
  }
  const TypedColumn<uint32_t>& utid() const {
    return static_cast<const ColumnType::utid&>(columns()[ColumnIndex::utid]);
  }

  TypedColumn<StringPool::Id>* mutable_name() {
    return static_cast<ColumnType::name*>(
        GetColumn(ColumnIndex::name));
  }
  TypedColumn<std::optional<ThreadTrackTable::Id>>* mutable_parent_id() {
    return static_cast<ColumnType::parent_id*>(
        GetColumn(ColumnIndex::parent_id));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_source_arg_set_id() {
    return static_cast<ColumnType::source_arg_set_id*>(
        GetColumn(ColumnIndex::source_arg_set_id));
  }
  TypedColumn<std::optional<MachineTable::Id>>* mutable_machine_id() {
    return static_cast<ColumnType::machine_id*>(
        GetColumn(ColumnIndex::machine_id));
  }
  TypedColumn<StringPool::Id>* mutable_classification() {
    return static_cast<ColumnType::classification*>(
        GetColumn(ColumnIndex::classification));
  }
  TypedColumn<std::optional<uint32_t>>* mutable_dimension_arg_set_id() {
    return static_cast<ColumnType::dimension_arg_set_id*>(
        GetColumn(ColumnIndex::dimension_arg_set_id));
  }
  TypedColumn<StringPool::Id>* mutable_event_type() {
    return static_cast<ColumnType::event_type*>(
        GetColumn(ColumnIndex::event_type));
  }
  TypedColumn<std::optional<StringPool::Id>>* mutable_counter_unit() {
    return static_cast<ColumnType::counter_unit*>(
        GetColumn(ColumnIndex::counter_unit));
  }
  TypedColumn<uint32_t>* mutable_utid() {
    return static_cast<ColumnType::utid*>(
        GetColumn(ColumnIndex::utid));
  }

 private:
  ThreadTrackTable(StringPool* pool,
            const TrackTable& parent,
            const RowMap& parent_overlay,
            ColumnStorage<ColumnType::utid::stored_type> utid)
      : macros_internal::MacroTable(
          pool,
          GetColumns(this, &parent),
          parent,
          parent_overlay),
          const_parent_(&parent)
,
        utid_storage_layer_(
        new column::NumericStorage<ColumnType::utid::non_optional_stored_type>(
          &utid_.vector(),
          ColumnTypeHelper<ColumnType::utid::stored_type>::ToColumnType(),
          false))
         {
    static_assert(
        ColumnLegacy::IsFlagsAndTypeValid<ColumnType::utid::stored_type>(
          ColumnFlag::utid),
        "Column type and flag combination is not valid");
    PERFETTO_DCHECK(utid.size() == parent_overlay.size());
    utid_ = std::move(utid);

    std::vector<RefPtr<column::OverlayLayer>> overlay_layers(OverlayCount(&parent) + 1);
    for (uint32_t i = 0; i < overlay_layers.size(); ++i) {
      if (overlays()[i].row_map().IsIndexVector()) {
        overlay_layers[i].reset(new column::ArrangementOverlay(
            overlays()[i].row_map().GetIfIndexVector(),
            column::DataLayerChain::Indices::State::kNonmonotonic));
      } else if (overlays()[i].row_map().IsBitVector()) {
        overlay_layers[i].reset(new column::SelectorOverlay(
            overlays()[i].row_map().GetIfBitVector()));
      } else if (overlays()[i].row_map().IsRange()) {
        overlay_layers[i].reset(new column::RangeOverlay(
            overlays()[i].row_map().GetIfIRange()));
      }
    }

    OnConstructionCompleted(
      {const_parent_->storage_layers()[ColumnIndex::id],const_parent_->storage_layers()[ColumnIndex::type],const_parent_->storage_layers()[ColumnIndex::name],const_parent_->storage_layers()[ColumnIndex::parent_id],const_parent_->storage_layers()[ColumnIndex::source_arg_set_id],const_parent_->storage_layers()[ColumnIndex::machine_id],const_parent_->storage_layers()[ColumnIndex::classification],const_parent_->storage_layers()[ColumnIndex::dimension_arg_set_id],const_parent_->storage_layers()[ColumnIndex::event_type],const_parent_->storage_layers()[ColumnIndex::counter_unit],utid_storage_layer_}, {{},{},{},const_parent_->null_layers()[ColumnIndex::parent_id],const_parent_->null_layers()[ColumnIndex::source_arg_set_id],const_parent_->null_layers()[ColumnIndex::machine_id],{},const_parent_->null_layers()[ColumnIndex::dimension_arg_set_id],{},{},{}}, std::move(overlay_layers));
  }
  TrackTable* parent_ = nullptr;
  const TrackTable* const_parent_ = nullptr;
  ColumnStorage<ColumnType::utid::stored_type> utid_;

  RefPtr<column::StorageLayer> utid_storage_layer_;

  
};

}  // namespace perfetto

#endif  // SRC_TRACE_PROCESSOR_TABLES_TRACK_TABLES_PY_H_
