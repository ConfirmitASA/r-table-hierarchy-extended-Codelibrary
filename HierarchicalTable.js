class HierarchicalTable {
    static function setUpTables(tables) {
        Config.tables = tables;
    }

    static function txtScriptPrint(globals) {
        var text = globals.text;
        var report = globals.report;
        var confirmit = globals.confirmit;

        var str = "<script>";
        var tables = Config.tables;

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