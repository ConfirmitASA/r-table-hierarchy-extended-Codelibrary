class HierarchicalTable {
    static var log : Logger;

    static var schemaId;
    static var databaseTableName;
    static var parentColumn;
    static var hierarchy = [];
    static var tables = [];

    static function setUpGlobalSettings(settings) {
        HierarchicalTable.schemaId = settings.schemaId;
        HierarchicalTable.databaseTableName = settings.databaseTableName;
        HierarchicalTable.parentColumn = settings.parentColumn;
    }

    static function setUpTables(tables) {
        HierarchicalTable.tables = tables;
    }

    static function txtScriptPrint(globals) {
        var text = globals.text;
        var report = globals.report;
        var confirmit = globals.confirmit;

        var str = "<script>";
        var tables = HierarchicalTable.tables;

        for (var index = 0; index < tables.length; index++) {
            var table = tables[index];
            var hierarchy;

            switch(table.type) {
                case 'plain':
                    hierarchy = TableCollapse.getTableStructure(table.tableName, report);
                    break;
                case 'flat_hierarchy':
                    hierarchy = TableCollapse.getTableStructure_Hier(table.tableName, report, confirmit, table);
                    break;
                case 'hierarchy_subheaders':
                    hierarchy = TableCollapse.getTableStructure_HierMix(table.tableName, report, confirmit, table);
                    break;
            }

            if (hierarchy) {
                text.Output.Append(JSON.print(hierarchy, "t" + index + "_hier"));

                str += "var t" + index + " = document.getElementById('" + table.tableContainerId + "');" +
                    "if (t" + index + ") {" +
                    "	var newT" + index + " = new Reportal.HierarchyExtended({table: t" + index + ".getElementsByTagName('tbody')[0], hier: t" + index + "_hier});" +
                    "}";
                str += "\n";
            }

            hierarchy = undefined;
        }

        str += "</script>";

        text.Output.Append(str);
    }
}