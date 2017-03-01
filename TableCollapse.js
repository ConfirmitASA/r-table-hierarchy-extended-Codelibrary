class TableCollapse {
    //get structure for table (no hierarchy, equal number of header levels in each row)
    static function getTableStructure(table, report) {
        var headers = report.TableUtils.GetRowHeaderCategoryTitles(table);
        var levels = headers[0].length - 1;
        var hier = [], blocks = [], block_ids = [];

        for (var j = levels; j >= 0; j--) {
            blocks[j] = '';
            block_ids[j] = '';
        }

        for (var i = 0; i < headers.length; i++) {
            for (var j = levels; j >= 0; j--) {
                if (blocks[j] == headers[i][j]) {
                    continue;
                } else {
                    blocks[j] = headers[i][j];
                    for (var k = j - 1; k >= 0; k--) {
                        blocks[k] = '';
                        block_ids[k] = '';
                    }
                }
                if (j < levels && block_ids[j] == '') {
                    block_ids[j] = hier.length;
                }
                addElement(hier, hier.length + 1, block_ids[j], levels - j, j);
            }
        }
        return hier;
    }

    //get structure for flat hierarchy (no other headers)
    static function getTableStructure_Hier(table, report, confirmit, tableConfig) {
        var hierarchy = getHier(confirmit, tableConfig);

        var headers = report.TableUtils.GetRowHeaderCategoryIds(table);
        var hier = [];
        for (var i = 0; i < headers.length; i++) {
            var parent = hierarchy[headers[i][0]], level = 0;
            if (i > 0 && parent == hier[i - 1].id) {
                level = hier[i - 1].level + 1;
                hier[i - 1].hasChildren = true;
            }
            else {
                for (var j = i - 1; j >= 0; j--) {
                    if (parent == hier[j].parent) {
                        level = hier[j].level;
                        break;
                    }
                }
            }
            addElement(hier, headers[i][0], parent, level, 0);
        }
        return hier;
    }

    //get structure for hierarchy (flat\nested) with 1 subheader level
    static function getTableStructure_HierMix(table, report, confirmit, tableConfig) {
        var hierarchy = getHier(confirmit, tableConfig);

        var headers = report.TableUtils.GetRowHeaderCategoryIds(table);
        var hier = [];
        var i = 0, levels, n, parent, level, child;
        while (i < headers.length) {
            n = i > 0 ? levels - (headers[i].length - 1) : 0;
            levels = headers[i].length - 1;
            for (var j = levels; j > 0; j--) {
                if (i > 0 && j + n > 0 && headers[i][j] == headers[i - 1][j + n]) {
                    continue;
                }
                parent = hierarchy[headers[i][j]];
                if (i == 0 && j == levels) {
                    level = 0;
                } else {
                    if (parent == hier[hier.length - 1].id) {
                        level = hier[hier.length - 1].level + 1;
                        hier[hier.length - 1].hasChildren = true;
                    } else {
                        for (var k = hier.length - 1; k >= 0; k--) {
                            if (parent == hier[k].parent) {
                                level = hier[k].level;
                                break;
                            }
                        }
                    }
                }
                addElement(hier, headers[i][j], parent, level, j);
            }
            child = 1;
            parent = hier.length - 1;
            for (var k = i; k < headers.length; k++) {
                addElement(hier, hier[parent].id + '_' +  child, hier[parent].id, hier[parent].level + 1, 0);
                hier[parent].hasChildren = true;
                if (k == headers.length - 1 || headers[k][1] != headers[k + 1][1]) {
                    break;
                } else {
                    child++;
                }
            }
            i += child;
        }
        return hier;
    }

    static function getHier(confirmit, tableConfig) {
        var schemaId = tableConfig.schemaId || Config.schemaId;
        var databaseTableName = tableConfig.databaseTableName || Config.databaseTableName;
        var hier = [];
        if (Config.schemaId == schemaId && Config.databaseTableName == databaseTableName) {
            if (Config.hierarchy && Config.hierarchy.length > 0) {
                return Config.hierarchy;
            } else {
                Config.hierarchy = hier;
            }
        }

        Config.log.LogDebug(schemaId);
        Config.log.LogDebug(databaseTableName);

        var db = confirmit.GetDBDesignerSchema(schemaId);
        var t = db.GetDBDesignerTable(databaseTableName);
        var rows = t.GetDataTable().Rows;
        for (var i = 0; i < rows.Count; i++) {
            var parentColumn = tableConfig.parentColumn || Config.parentColumn;
            hier[rows[i]['id'].toLowerCase()] = rows[i][parentColumn] ? rows[i][parentColumn].toLowerCase() : '';
        }

        return hier;
    }

    static function addElement(hier, id, parent, level, j) {
        var el = {id: id, parent: parent, level: level, hasChildren: (j > 0 ? true : false)};
        hier.push(el);
    }

}