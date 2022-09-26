package org.silzila.app.querybuilder;

import java.util.stream.Collectors;

import org.silzila.app.domain.QueryClauseFieldListMap;
import org.silzila.app.dto.DatasetDTO;
import org.silzila.app.exception.BadRequestException;
import org.silzila.app.payload.request.Query;
import org.springframework.stereotype.Service;

@Service
public class QueryComposer {

    /*
     * Builds query based on Dimensions and Measures of user selection.
     * Query building is split into many sections:
     * like Select clause, Join clause, Where clause,
     * Group By clause & Order By clause
     * Different dialects will have different syntaxes.
     */
    public String composeQuery(Query req, DatasetDTO ds, String vendorName) throws BadRequestException {

        QueryClauseFieldListMap qMap = new QueryClauseFieldListMap();
        String finalQuery = "";
        String selectClause = "";
        String groupByClause = "";
        String orderByClause = "";

        /*
         * builds JOIN Clause of SQL - same for all dialects
         */
        String fromClause = RelationshipClauseGeneric.buildRelationship(req, ds.getDataSchema());

        /*
         * builds SELECT Clause of SQL
         * SELECT clause is the most varying of all clauses, different for each dialect
         * select_dim_list columns are used in group_by_dim_list & order_by_dim_list
         * except that
         * select_dim_list has column alias and group_by_dim_list & order_by_dim_list
         * don't have alias
         */

        if (vendorName.equals("postgresql")) {
            System.out.println("------ inside postges block");
            qMap = SelectClausePostgres.buildSelectClause(req);
        } else if (vendorName.equals("mysql")) {
            System.out.println("------ inside mysql block");
            qMap = SelectClauseMysql.buildSelectClause(req);
        } else {
            throw new BadRequestException("Error: DB vendor Name is wrong!");
        }

        selectClause = "\n\t" + qMap.getSelectList().stream().collect(Collectors.joining(",\n\t"));
        groupByClause = "\n\t" + qMap.getGroupByList().stream().collect(Collectors.joining(",\n\t"));
        orderByClause = "\n\t" + qMap.getOrderByList().stream().collect(Collectors.joining(",\n\t"));

        if (!req.getDimensions().isEmpty()) {
            finalQuery = "SELECT " + selectClause + "\nFROM" + fromClause + "\nGROUP BY" + groupByClause + "\nORDER BY"
                    + orderByClause;
        } else if (!req.getMeasures().isEmpty()) {
            finalQuery = "SELECT " + selectClause + "\nFROM" + fromClause;
        }

        return finalQuery;

    }
}