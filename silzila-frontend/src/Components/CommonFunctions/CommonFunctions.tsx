import FetchData from "../ServerCall/FetchData";
import { ColorSchemes } from "../ChartOptions/Color/ColorScheme";
import { IFilter } from "../DataSet/BottomBarInterfaces";


export const validateEmail = (email: string) => {
	const res =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var result = res.test(String(email).toLowerCase());
	return result;
};

export const validateMandatory = (value: string) => {
	if (value) {
		return value.length >= 1 ? true : false;
	} else {
		return false;
	}
};

export const validatePassword = (password: string) => {
	// return password.length >= 8 ? true : false;
	// TODO: need to change 4 to 6 after testing
	return password.length >= 4 ? true : false;
};

export const validateEqualValues = (value1: string, value2: string) => {
	return value1 === value2;
};

export const interpolateColor = (startColor: any, endColor: any, steps: any) => {
    const colorMap = (value: any, start: any, end: any) => start + Math.round(value * (end - start));
    const parseColor = (color: any) => color?.match(/\w\w/g)?.map((hex: any) => parseInt(hex, 16));

    const startRGB = parseColor(startColor);
    const endRGB = parseColor(endColor);

    return Array.from({ length: steps }, (_, index) => {
        const t = index / (steps - 1);
        return `rgb(${colorMap(t, startRGB[0], endRGB[0])},${colorMap(t, startRGB[1], endRGB[1])},${colorMap(t, startRGB[2], endRGB[2])})`;
    });
};

export const generateRandomColorArray = (length:number) => {
	const colorArray = [];
	
	for (let i = 0; i < length; i++) {	 	
		colorArray.push(_getRandomcolor());		
	}
	
	return colorArray;
  }

  const _getRandomcolor = () : any => {
	let randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

	if(isValidColor(randomColor)){
		return randomColor;
	}
	else{
		return _getRandomcolor();
	}
  }


  export const  getContrastColor = (backgroundColor:string) =>{
	// Function to calculate relative luminance
	const getRelativeLuminance = (color:any) => {
	  const rgb = parseInt(color.slice(1), 16); // Convert hex to decimal
	  const r = (rgb >> 16) & 0xff;
	  const g = (rgb >>  8) & 0xff;
	  const b = (rgb >>  0) & 0xff;
  
	  const sRGB = [r / 255, g / 255, b / 255];
	  const sRGBTransform = sRGB.map((val) => {
		if (val <= 0.04045) {
		  return val / 12.92;
		} else {
		  return Math.pow((val + 0.055) / 1.055, 2.4);
		}
	  });
  
	  return 0.2126 * sRGBTransform[0] + 0.7152 * sRGBTransform[1] + 0.0722 * sRGBTransform[2];
	};
  
	// Calculate the relative luminance of the background color
	const bgLuminance = getRelativeLuminance(backgroundColor);
  
	// Determine the contrast ratio
	const contrast = (bgLuminance + 0.05) / 0.05; // Add 0.05 to avoid division by zero
  
	// Choose black or white based on the contrast ratio
	//return contrast > 4.5 ? '#000000' : '#ffffff';
	return contrast > 4.3 ? '#000000' : '#ffffff';
  }

  const isValidColor = (color:any) =>{
	const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	return hexColorRegex.test(color);
  }


  const _changeJSONObjectOrder = (orderedArray:any, item:any)=>{	

	const entries = Object.entries(item);

	entries.sort(([keyA], [keyB]) => {
	return orderedArray.indexOf(keyA) - orderedArray.indexOf(keyB);
	});

	return Object.fromEntries(entries);
  }

  export const changeChartDataToAxesOrder = (chartData:any, chartProp:any, propKey:string)=>{
	let fields:any = [];
	let fieldsNames:string[] = [];
	let orderedChartData:any = [];

	switch(chartProp.properties[propKey].chartType){
		case "pie":
		case "rose":
		case "donut":
		case "line":
		case "area":
		case "step line":
		case "stackedArea":
		case "multibar":
		case "stackedBar":
		case "horizontalStacked":
		case "horizontalBar":
			fields = chartProp.properties[propKey].chartAxes[1].fields;
			fields = [...fields, ...chartProp.properties[propKey].chartAxes[2].fields];
		break;
	}

	if(fields && fields.length > 0){
		for(let field of fields){
			fieldsNames.push(fieldName(field));
		}
	
		chartData.forEach((data:any)=>{
			orderedChartData.push(_changeJSONObjectOrder(fieldsNames, data))
		})
	
		return orderedChartData;
	}
	else{
		return chartData;
	}	
  }


  
  export const getLabelValues = async (columnName: string, chartControls:any, chartProperties:any, propKey:string, token:string) => {
		try {
			let fieldValues: any = [];
			let field: any = {}

			var chartThemes: any[];
			var chartControl: any = chartControls.properties[propKey];
		  
			chartThemes = ColorSchemes.filter(el => {
				return el.name === chartControl.colorScheme;
			});
		  

			// checking the column type To generate the name as it is in the chartData
			// chartProperties.properties[propKey].chartAxes[1].fields.forEach(async (el: any) => {
			// 	//if (el.dataType === "date") {
			// 	//console.log();
			// 	if (columnName.includes(el.fieldname)) {
			// 		//formattedColumnName = `${el.timeGrain} of ${el.fieldname}`;
			// 		if(["date", "timestamp"].includes(el.dataType)){
			// 			if(columnName.split(' of ')[0] === el.timeGrain){
			// 				field = el;
			// 				return;
			// 			}
			// 		}
			// 		else{
			// 			field = el;
			// 			return;
			// 		}
			// 	}
			// 	//}
			// });

			// checking the column type To generate the name as it is in the chartData
			chartProperties.properties[propKey].chartAxes[1].fields.forEach(async (el: any) => {
				//if (el.dataType === "date") {
				//console.log();
				if (columnName.includes(el.fieldname)) {
					//formattedColumnName = `${el.timeGrain} of ${el.fieldname}`;
					if(["date", "timestamp"].includes(el.dataType)){
						if(columnName.split(' of ')[0] === el.timeGrain){
							field = el;
							return;
						}
					}
					else{
						field = el;
						return;
					}
				}
				//}
			});


			let formattedColumnName = ["date", "timestamp"].includes(field.dataType) ? field.timeGrain : columnName;
			fieldValues = await fetchFieldData(field, chartProperties, propKey, token);

			//let colors = interpolateColor("#2BB9BB", "#D87A80", fieldValues?.data?.length);
			let length = chartThemes[0].colors.length > fieldValues?.data?.length ? chartThemes[0].colors.length - fieldValues?.data?.length :
							fieldValues?.data?.length -chartThemes[0].colors.length ;

			let randomColors = generateRandomColorArray(length);
			let colors = chartThemes[0].colors;

			colors = [...colors, ...randomColors]

			const values = fieldValues?.data?.map((item: any, idx: number) => {
				//console.log(item, columnName);
				return {
					colValue: item[formattedColumnName],
					backgroundColor: colors[idx],
					isBold: false,
					isItalic: false,
					isUnderlined: false,
					fontColor: getContrastColor(colors[idx]),
				};
			});

			return values;
		}
		catch (err) {
			console.error(err)
		}
	};


	const _findFieldName = (name: string, i: number = 2, _fieldTempObject:any): string => {
		if (_fieldTempObject[`${name}(${i})`] !== undefined) {
		  i++;
		  return _findFieldName(name, i, _fieldTempObject);
		} else {
		  return `${name}(${i})`;
		}
	};


	export const FindFieldName = (name: string, i: number = 2): string => {
		let _fieldTempObject: any = {};

		return _findFieldName(name, i, _fieldTempObject)
	}

	export const fieldName = (field:any)=>{
		if(field){
			if(field.agg || field.timeGrain){
				if(["date", "timestamp"].includes(field.dataType)){
					return `${field.timeGrain} of ${field.fieldname}`;
				}
				else{
					return `${field.agg} of ${field.fieldname}`;
				}
			}
			else{
				return field.fieldname;
			}
		}
		else{
			return field;
		}				
	}
	export const displayName = (field: any) => {
		if (field) {
			return field.displayname;
		}
		return field;
	};

	export const fieldNameConvert = (fieldname: string, chartControls: any, propKey: string) => {
		const chartAxes = chartControls.properties[propKey]?.chartAxes;
		for (const axis of chartAxes) {
		  const field = axis.fields.find((field: any) => field.fieldname === fieldname);
		  if (field) {
			return field.displayname;
		  }
		}
		return fieldname;
	  };



 	export const findNewDisplayName = (chartAxes: any, paramField:any, allowedNumbers: number): any => {       
	
		let _measureZone: any = chartAxes.find(
		(zones: any) => zones.name === "Measure"
		);		

		let _fieldTempObject: any = {};

		/*	Find and return field's new name	*/
		const findFieldName = (name: string, i: number = 0): string => {
			if ((i === 0 && _fieldTempObject[name] !== undefined) || _fieldTempObject[`${name}(${i})`] !== undefined) {
				i = i === 0 ? 1 : i;	

				i++;
				return findFieldName(name, i);
			} else {
				if(i === 0){
					return name;
				}
				else{
					return `${name}(${i})`;
				}
			}
		};

		if(allowedNumbers === _measureZone?.fields.length){
			return paramField.displayname;
		}

		_measureZone?.fields.forEach((field: any, index: number) => {
			let _nameWithAgg: string = "";
			let _tempField = JSON.parse(JSON.stringify(field));	

			_nameWithAgg = _tempField.displayname;		

			if (_fieldTempObject[_nameWithAgg] !== undefined) {
				let _name = findFieldName(_nameWithAgg);
				_tempField["NameWithAgg"] = _name;
				_fieldTempObject[_name] = "";							
			} else {
				_tempField["NameWithAgg"] = _nameWithAgg;
				_fieldTempObject[_nameWithAgg] = "";
			}
		});	

		let newName = findFieldName(paramField.displayname)

		return newName || paramField.displayname;
	};

	const fetchFieldData = (bodyData: any, chartProperties:any, propKey:string, token:string) => {

		//  bodyData: any = {
		// 	tableId: tableId,
		// 	fieldName: displayname,
		// 	dataType: dataType,
		// 	filterOption: "allValues",
		// };
		if (bodyData.dataType === "timestamp" || bodyData.dataType === "date") {
			bodyData["timeGrain"] = bodyData.timeGrain || "year";
		}

		bodyData.filterOption = "allValues";
		bodyData.fieldName = bodyData.fieldname
		// bodyData.displayName = bodyData.displayname

		

		return FetchData({
			requestType: "withData",
			method: "POST",
			url: `filter-options?dbconnectionid=${chartProperties.properties[propKey].selectedDs.connectionId}&datasetid=${chartProperties.properties[propKey].selectedDs.id}`,
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
			data: bodyData,
		});
	};
	export const modifyFilter=(filter:any):IFilter=>{
		if(filter.fieldtypeoption==="Pick List"){
		  return {
			filterType:"pickList",
			tableId:filter.tableId,
			uid:filter.uId,
			dataType:filter.dataType,
			fieldName:filter.fieldname,
			shouldExclude:filter.includeexclude.toLowerCase()==="exclude"?true:false,
			operator:"in",
			tableName:"",
			isTillDate:filter.exprTypeTillDate??false,
			userSelection:filter.userSelection.filter((el:any)=>el!=="(All)"),
			...(filter.dataType === "date" || filter.dataType === "timestamp"
			  ? { timeGrain: filter.prefix }
			  : {}),
	
		  }
		}
		else if(filter.fieldtypeoption==="Search Condition"){
		  return {
			filterType:"searchCondition",
			tableId:filter.tableId,
			tableName:"",
			uid:filter.uId,
			isTillDate:filter.exprTypeTillDate??false,
			dataType:filter.dataType,
			fieldName:filter.fieldname,
			operator:filter.exprType,
			shouldExclude:filter.includeexclude.toLowerCase()==="exclude"?true:false,
			userSelection:filter.exprType==="between"?[filter.greaterThanOrEqualTo,filter.lessThanOrEqualTo]:[filter.exprInput],
			...(filter.dataType === "date" || filter.dataType === "timestamp"
			  ? { timeGrain: filter.prefix }
			  : {}),
		  }
		}
		else {
		  // return {}
		  return {
		  filterType:"relativeFilter",
		  tableId:filter.tableId,
		  uid:filter.uId,
		  dataType:filter.dataType,
		  fieldName:filter.fieldname,
		  shouldExclude:filter.includeexclude.toLowerCase()==="exclude"?true:false,
		  operator:"between",
		  tableName:"",
		  isTillDate:filter.exprTypeTillDate??false,
		  timeGrain: "date",
		  userSelection:[],
		  relativeCondition:{
			from:[filter.expTypeFromRelativeDate,filter.exprInputFromValueType,filter.expTypeFromdate],
			to:[filter.expTypeToRelativeDate,filter.exprInputToValueType,filter.expTypeFromdate],
			anchorDate:filter.expTypeAnchorDate!=="today"?filter.expTypeAnchorDate:filter.expTypeAnchorDate
		  }
		}
		}
	}