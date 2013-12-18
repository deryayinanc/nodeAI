/**
 * Created by derya on 05/11/13.
 */

var sp500historical = require('../models/sp500historical');
var currencyhistorical = require('../models/currencyhistorical');

var fann = require('fann');

var Stats = require('fast-stats').Stats;


var http = require('http');
var options = {
    host: 'localhost',
    port:'3000',
    path: '/test'
};


exports.doRead = function(req,res){
    sp500historical.read(function(rows){
        console.log(rows);
        res.send(200);
    })
}


/*
 Useful functions
 */

function date_by_subtracting_days(date, days) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() - days,
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    );
}

exports.trainAI = function(req,res){
    results = new Array();
    computedResults = new Array();
    trainingArray = new Array();
    testArray = new Array();
    computedTestResults = new Array();
    date = new Date();
    aiResult = 0;


    sp500historical.read(function(rows){

        for(var i=0; i<rows.length; i++){
            date=rows[i].Date;

            dataObj = new Object();
            dataObj.Date = rows[i].Date;
            dataObj.Open = rows[i].Open;
            dataObj.High = rows[i].High;
            dataObj.Low = rows[i].Low;
            dataObj.Close = rows[i].Close;
            dataObj.Volume = rows[i].Volume;
            dataObj.Adj_Close = rows[i].Adj_Close;


            if (date.getFullYear() > 2011){
                //console.log(dataObj);
                //console.log(date.getMonth());
                if(date.getFullYear() == 2013 && date.getMonth() > 8){
                    testArray.push(dataObj);
                    //console.log(date.getFullYear());
                    //console.log(date.getMonth());

                } else {

                    results.push(dataObj);
                }

            }
        }

        // Calculate Statistical Variables

        var openStat = new Stats();
        var highStat = new Stats();
        var lowStat = new Stats();
        var closeStat = new Stats();
        var volStat = new Stats();
        var adjCloseStat = new Stats();




        for(var i=0;i<results.length; i++){
            openStat.push(results[i].Open);
            highStat.push(results[i].High);
            lowStat.push(results[i].Low);
            closeStat.push(results[i].Close);
            volStat.push(results[i].Volume);
            adjCloseStat.push(results[i].Adj_Close);

        }



        for(var i=0;i<results.length; i++){
            dataObj = new Object();


            if(i!=0){

                dataObj.Date = results[i].Date;
                dataObj.Open = ((results[i].Open - openStat.range()[0])/(openStat.range()[1]-openStat.range()[0])).toFixed(2);
                dataObj.High = ((results[i].High - highStat.range()[0])/(highStat.range()[1]-highStat.range()[0])).toFixed(2);
                dataObj.Low = ((results[i].Low - lowStat.range()[0])/(lowStat.range()[1]-lowStat.range()[0])).toFixed(2);
                dataObj.Close = ((results[i].Close - closeStat.range()[0])/(closeStat.range()[1]-closeStat.range()[0])).toFixed(2);
                dataObj.Volume = ((results[i].Volume - volStat.range()[0])/(volStat.range()[1]-volStat.range()[0])).toFixed(2);
                dataObj.Adj_Close = ((results[i].Adj_Close - adjCloseStat.range()[0])/(adjCloseStat.range()[1]-adjCloseStat.range()[0])).toFixed(2);
                dataObj.upDown = ((results[i-1].Close - closeStat.range()[0])/(closeStat.range()[1]-closeStat.range()[0])).toFixed(2);

                /*
                 if(results[i-1].Close > results[i].Close){
                 dataObj.upDown = 1;
                 }else {
                 dataObj.upDown = 0;

                 } */
                //console.log(dataObj);
                computedResults.push(dataObj);
            }
        }

        //console.log(computedResults);
        // Calculate Statistical Variables

        var testOpenStat = new Stats();
        var testHighStat = new Stats();
        var testLowStat = new Stats();
        var testCloseStat = new Stats();
        var testVolStat = new Stats();
        var testAdjCloseStat = new Stats();




        for(var i=0;i<testArray.length; i++){
            testOpenStat.push(testArray[i].Open);
            testHighStat.push(testArray[i].High);
            testLowStat.push(testArray[i].Low);
            testCloseStat.push(testArray[i].Close);
            testVolStat.push(testArray[i].Volume);
            testAdjCloseStat.push(testArray[i].Adj_Close);

        }


        for(var i=0;i<testArray.length; i++){
            dataObj = new Object();


            if(i!=0){

                dataObj.Date = testArray[i].Date;
                dataObj.closeRaw = testArray[i].Close;
                dataObj.Open = ((testArray[i].Open - testOpenStat.range()[0])/(testOpenStat.range()[1]-testOpenStat.range()[0])).toFixed(2);
                dataObj.High = ((testArray[i].High - testHighStat.range()[0])/(testHighStat.range()[1]-testHighStat.range()[0])).toFixed(2);
                dataObj.Low = ((testArray[i].Low - testLowStat.range()[0])/(testLowStat.range()[1]-testLowStat.range()[0])).toFixed(2);
                dataObj.Close = ((testArray[i].Close - testCloseStat.range()[0])/(testCloseStat.range()[1]-testCloseStat.range()[0])).toFixed(2);
                dataObj.Volume = ((testArray[i].Volume - testVolStat.range()[0])/(testVolStat.range()[1]-testVolStat.range()[0])).toFixed(2);
                dataObj.Adj_Close = ((testArray[i].Adj_Close - testAdjCloseStat.range()[0])/(testAdjCloseStat.range()[1]-testAdjCloseStat.range()[0])).toFixed(2);
                dataObj.upDown = ((testArray[i-1].Close - testCloseStat.range()[0])/(testCloseStat.range()[1]-testCloseStat.range()[0])).toFixed(2);
                dataObj.realClose = testArray[i-1].Close;
                dataObj.realMultiplier = (testCloseStat.range()[1]-testCloseStat.range()[0]).toFixed(2);
                dataObj.realAdd = (testCloseStat.range()[0]).toFixed(2);
                /*
                 if(testArray[i-1].Close > testArray[i].Close){
                 dataObj.upDown = 1;
                 }else {
                 dataObj.upDown = 0;

                 } */

                computedTestResults.push(dataObj);
                //console.log(dataObj);

            }
        }

        //console.log(computedResults);

        for(var i=0;i<computedResults.length;i++){
            inputArr = new Array();
            outputArr = new Array();
            jointArr = new Array();

            //inputArr.push(computedResults[i].Open);
            //inputArr.push(computedResults[i].High);
            //inputArr.push(computedResults[i].Low);
            inputArr.push(computedResults[i].Close);
            //inputArr.push(computedResults[i].Volume);
            //inputArr.push(computedResults[i].Adj_Close);
            outputArr.push(computedResults[i].upDown);

            jointArr.push(inputArr);
            jointArr.push(outputArr);

            trainingArray.push(jointArr);

            //console.log(trainingArray);
        }

        var net = new fann.standard(1,2,1);
        net.train(trainingArray,{error:0.0016});

        ratioVar = 0;
        count = 0;
        diffVar = 0;

        for (var i = 0; i< computedTestResults.length; i++){
            //aiResult = net.run([computedTestResults[i].Open, computedTestResults[i].High, computedTestResults[i].Low, computedTestResults[i].Close, computedTestResults[i].Volume]);
            aiResult = net.run([computedTestResults[i].Open,computedTestResults[i].High,computedTestResults[i].Low, computedTestResults[i].Close, computedTestResults[i].Volume, computedResults[i].Adj_Close]);
            resultDate = computedTestResults[i].Date;

            resultStr = new String();
            differenceStr = new String();
            direction = new Boolean();
            resultInt = ((Number(aiResult)* Number(computedTestResults[0].realMultiplier))+Number(computedTestResults[0].realAdd)).toFixed(2);
            differenceInt = (100*(resultInt-Number(computedTestResults[i].realClose))/Number(computedTestResults[i].realClose)).toFixed(2);

            if((computedTestResults[i].closeRaw - computedTestResults[i].realClose  > 0) && ( resultInt - computedTestResults[i].realClose > 0)){
                direction = true;
            } else if ((computedTestResults[i].realClose - computedTestResults[i].closeRaw < 0) && (resultInt - computedTestResults[i].realClose < 0)){
                direction = true;
            } else {
                direction = false;
            }

            outputStr = resultDate+"-AIResult:"+resultInt+"-realClose:"+computedTestResults[i].closeRaw+"-nextDayClose:"+computedTestResults[i].realClose;
            differenceStr = ((Number(aiResult)* Number(computedTestResults[0].realMultiplier))+Number(computedTestResults[0].realAdd)-Number(computedTestResults[i].realClose))/Number(computedTestResults[i].realClose).toFixed(2);
            console.log(outputStr);
            console.log(differenceInt);
            console.log(direction);

            //console.log(resultDate,"-", ((aiResult*computedTestResults[i].realMultiplier)+computedTestResults[i].realAdd));
            //console.log(computedTestResults[i].realClose);
            count = count +1;
            diffVar = diffVar + (1+Math.abs(differenceInt));
            if(direction){

                ratioVar = ratioVar + 1;
            }

        }

        console.log('Directional Truth:'+ratioVar/count * 100);
        console.log('Average Difference:'+(diffVar/count)-1);







        //console.log(date.getFullYear());
        res.send(200);

    })
}


//exports.trainAI2 = function(req,res){
//
//
//
//            //console.log(combinedDataArray.length);
//
//
//
//        console.log(trainArr.length);
//        console.log(trainArr);
//
//        var net = new fann.standard(7,5,1);
//        net.train(trainArr,{error:0.001});
//
//
//        /*
//            Test results set here
//         */
//
//            //modify dataset here
//            for(var i=1;i<175;i++){
//                if(combinedDataArray[i].Date >finalTrainingDate){
//                    dataObj = new Object();
//                    jointArr = new Array();
//
//                    dataObj.SPYt1 = ((combinedDataArray[i].Close-combinedDataArray[i+1].Close)/combinedDataArray[i+1].Close).toFixed(4); //Total Return Close T1 - CloseT0/CloseT0
//                    dataObj.SPYt2 = ((combinedDataArray[i].Close-combinedDataArray[i+2].Close)/combinedDataArray[i+2].Close).toFixed(4);
//                    dataObj.SPYt3 = ((combinedDataArray[i].Close-combinedDataArray[i+3].Close)/combinedDataArray[i+3].Close).toFixed(4);
//                    dataObj.SPYt5 = ((combinedDataArray[i].Close-combinedDataArray[i+5].Close)/combinedDataArray[i+5].Close).toFixed(4);
//                    dataObj.SPYt10 = ((combinedDataArray[i].Close-combinedDataArray[i+10].Close)/combinedDataArray[i+10].Close).toFixed(4);
//                    dataObj.MACD5 = ((avgFive-combinedDataArray[i].Close)/combinedDataArray[i].Close).toFixed(4);
//                    dataObj.MACD10 = ((avgTen-combinedDataArray[i].Close)/combinedDataArray[i].Close).toFixed(4);
//                    dataObj.Volume = ((combinedDataArray[i].Volume-trainStatVolumeMin)/(trainStatVolumeMax-trainStatVolumeMin)).toFixed(4);
//                    dataObj.USD_EUR = ((combinedDataArray[i].USD_EUR-trainStatUSD_EURMin)/(trainStatUSD_EURMax-trainStatUSD_EURMin)).toFixed(4);
//                    dataObj.USD_GBP = ((combinedDataArray[i].USD_GBP-trainStatUSD_GBPMin)/(trainStatUSD_GBPMax-trainStatUSD_GBPMin)).toFixed(4);
//
//
//                    if(rows[i].Close < combinedDataArray[i-1].Close){
//                        dataObj.nextDayClose = 1;
//                    } else {
//                        dataObj.nextDayClose = 0;
//                    }
//
//                    //dataObj.nextDayClose = rows[i-1].Close;
//                    //inputArr.push.apply(inputArr, [dataObj.SPYt1,dataObj.SPYt2,dataObj.SPYt3,dataObj.Volume, dataObj.USD_EUR, dataObj.USD_GBP] );
//                    testInputArr.push.apply(inputArr, [dataObj.SPYt1,dataObj.SPYt2,dataObj.SPYt3,dataObj.SPYt5,dataObj.SPYt10,dataObj.MACD5, dataObj.MACD10] );
//                    testOutputArr.push.apply(outputArr, [dataObj.nextDayClose] );
//
//
//                }
//
//
//
//
//            }
//
//
//            //test Set
//            //Stat set
//            testStatSPYt1 = new Stats();
//            testStatSPYt2 = new Stats();
//            testStatSPYt3 = new Stats();
//            testStatVolume = new Stats();
//            testStatUSD_EUR = new Stats();
//            testStatUSD_GBP = new Stats();
//
//
//
//            //Prepare Stat Set
//            for(var i=0;i<inputArr.length;i++){
//                if(inputArr[i].Date <=finalTrainingDate){
//                    testStatSPYt1.push(testInputArr[i].SPYt1);
//                    testStatSPYt2.push(testInputArr[i].SPYt2);
//                    testStatSPYt3.push(testInputArr[i].SPYt3);
//                    testStatVolume.push(testInputArr[i].Volume);
//                    testStatUSD_EUR.push(testInputArr[i].USD_EUR);
//                    testStatUSD_GBP.push(testInputArr[i].USD_GBP);
//                }
//
//
//            }
//
//            testStatSPYt1Min = testStatSPYt1.range()[0];
//            testStatSPYt1Max = testStatSPYt1.range()[1];
//            testStatSPYt2Min = testStatSPYt2.range()[0];
//            testStatSPYt2Max = testStatSPYt2.range()[1];
//            testStatSPYt3Min = testStatSPYt3.range()[0];
//            testStatSPYt3Max = testStatSPYt3.range()[1];
//            testStatVolumeMin = testStatVolume.range()[0];
//            testStatVolumeMax = testStatVolume.range()[1];
//            testStatUSD_EURMin = testStatUSD_EUR.range()[0];
//            testStatUSD_EURMax = testStatUSD_EUR.range()[1];
//            testStatUSD_GBPMin = testStatUSD_GBP.range()[0];
//            testStatUSD_GBPMax = testStatUSD_GBP.range()[1];
//
//
//            jointArr.push(inputArr);
//            jointArr.push(outputArr);
//
//            testArr.push(jointArr);
//
//            resultDate = combinedDataArray[i].Date;
//            aiResult = net.run(inputArr);
//            correctResult = outputArr[0];
//
//            count = count + 1;
//            if((aiResult == 1 && correctResult == 1) || (aiResult != 0 && correctResult != 0) ||
//                (aiResult == 0 && correctResult == 0))  {
//                correctDir = correctDir + 1;
//            }
//            console.log("Date:"+resultDate+"AI:"+aiResult+"Real:"+correctResult);
//
//            console.log(testArr.length);
//        console.log(100*correctDir/count);
//        res.send(correctDir/count,200);
//
//        });
//    });
//}

exports.testImplement = function(req, res){
    correctCount = 0;
    count = 0;
    trainingArray("2013-10-31","train",function(inputArr,outputArr){
        trainArr = new Array();
        for(var i=0; i<inputArr.length;i++){
            jointArr = new Array();
            outputArrValue = new Array();
            outputArrValue.push(outputArr[i][0]);
            jointArr.push(inputArr[i],outputArrValue);
            trainArr.push(jointArr);
        }
        var net = new fann.standard(8,6,1);
        net.train(trainArr,{error:0.01});
        trainingArray("2013-10-31","test",function(testInputArr,testOutputArr){

            testArr = new Array();
            for(var i=0; i<testInputArr.length;i++){
                jointArr = new Array();
                outputArrValue = new Array();
                outputArrValue.push(testOutputArr[i][0]);
                jointArr.push(testInputArr[i],outputArrValue);
                testArr.push(jointArr);

                aiResult = Number(net.run(testInputArr[i]));
                realResult = Number(testOutputArr[i][0]);
                if(realResult != 2){
                    count = count + 1;
                }
                console.log("AI Result:"+aiResult+" Real Result:"+ testOutputArr[i][0]+" Date:"+testOutputArr[i][1]);
                if((aiResult >= 0.5 && realResult == 1) || (aiResult < 0.5 && realResult == 0)){
                    correctCount = correctCount + 1;
                }


            }
            //net.test(testArr);
            error = net.get_MSE();
            inputs = net.get_num_input();
            output = net.get_num_output();
            neurons = net.get_total_neurons();
            weights = net.get_weight();



            console.log((correctCount / count));
            if((correctCount / count) >= 0.7){
                res.send("yes",200);
                //net.save("ai1.ai");
            } else {
                res.send("no",200);
            }
            //console.log(error);
            //console.log(inputs);
            //console.log(output);
            //console.log(neurons);
            //console.log(weights);


        });

    });
}

exports.demonstrateAI = function(req,res){
    var net = new fann.load("ai1.ai");
    trainingArray("2013-08-30","test",function(testInputArr,testOutputArr){
        testArr = new Array();
        outputArr = new Array();
        for(var i=0; i<testInputArr.length;i++){
            jointArr = new Array();






            aiResult = Number(net.run(testInputArr[i]));
            realResult = Number(testOutputArr[i][0]);
            dateRun = testOutputArr[i][1];

            jointArr.push(dateRun, aiResult,realResult);
            outputArr.push(jointArr);


        }

        res.send(outputArr);
    });



}


var trainingArray = function(trainingDate, type, callback){
    trainArr = new Array();


    if(type=='train'){

        finalTrainingDate = new Date(trainingDate);
        beginTrainingDate = date_by_subtracting_days(finalTrainingDate, 45);
    } else if (type =='test'){
        finalTrainingDate = new Date(Date.now());
        beginTrainingDate = new Date(trainingDate);
    }
    arrDateMax = new Date(0);
    //console.log(beginTrainingDate);
    //finalTrainingDate = new Date("06/30/2013");
    combinedDataArray = new Array();

    inputArr = new Array();
    normalizedInputArr = new Array();
    outputArr = new Array();





    sp500historical.read(function(rows){




            for(var i=0;i<rows.length;i++){

                    dataObj = new Object();

                    spDate = rows[i].Date;

                    //console.log(currencyDate);



                        //console.log(spDate);
                        //console.log(currencyDate);
                        dataObj.Date = spDate;
                        dataObj.Close = rows[i].Close;
                        dataObj.Volume = rows[i].Volume;
                        combinedDataArray.push(dataObj);


            }


            //modify dataset here
            for(var i=0;i<combinedDataArray.length;i++){
                //console.log(beginTrainingDate);




                if(combinedDataArray[i].Date <=finalTrainingDate && beginTrainingDate < combinedDataArray[i].Date ){

                    dataObj = new Object();
                    inputTempArr = new Array();
                    outputTempArr = new Array();
                    jointArr = new Array();

                    sum5 = 0;
                    sum10 = 0;
                    sum15 = 0;
                    avgFive = 0;
                    avgTen = 0;
                    avgFifteen = 0;

                    //5 day moving average
                    for(var j=i;j<i+5;j++){
                        sum5 = sum5 + combinedDataArray[j].Close;
                    }

                    for(var j=i;j<i+10;j++){
                        sum10 = sum10 + combinedDataArray[j].Close;
                    }

                    for(var j=i;j<i+15;j++){
                        sum15 = sum15 + combinedDataArray[j].Close;
                    }
                    avgFive = sum5/5;
                    avgTen = sum10/10;
                    avgFifteen = sum15/15;



                    dataObj.SPYt1 = ((combinedDataArray[i].Close-combinedDataArray[i+1].Close)/combinedDataArray[i+1].Close); //Total Return Close T1 - CloseT0/CloseT0
                    dataObj.SPYt2 = ((combinedDataArray[i].Close-combinedDataArray[i+2].Close)/combinedDataArray[i+2].Close);
                    dataObj.SPYt3 = ((combinedDataArray[i].Close-combinedDataArray[i+3].Close)/combinedDataArray[i+3].Close);
                    dataObj.SPYt5 = ((combinedDataArray[i].Close-combinedDataArray[i+5].Close)/combinedDataArray[i+5].Close);
                    dataObj.SPYt10 = ((combinedDataArray[i].Close-combinedDataArray[i+10].Close)/combinedDataArray[i+10].Close);
                    dataObj.MACD5 = avgFive;
                    dataObj.MACD10 = avgTen;
                    dataObj.MACD15 = avgFifteen;
                    dataObj.Volume = combinedDataArray[i].Volume;

                    /*
                    dataObj.Volume = ((combinedDataArray[i].Volume-trainStatVolumeMin)/(trainStatVolumeMax-trainStatVolumeMin));
                    dataObj.USD_EUR = ((combinedDataArray[i].USD_EUR-trainStatUSD_EURMin)/(trainStatUSD_EURMax-trainStatUSD_EURMin));
                    dataObj.USD_GBP = ((combinedDataArray[i].USD_GBP-trainStatUSD_GBPMin)/(trainStatUSD_GBPMax-trainStatUSD_GBPMin));
                    */
                    if(type == 'test' && i == 0){
                        dataObj.nextDayClose = 2;
                    } else if(rows[i].Close < combinedDataArray[i-1].Close){
                        dataObj.nextDayClose = 1;
                    } else {
                        dataObj.nextDayClose = 0;
                    }

                    //dataObj.nextDayClose = rows[i-1].Close;
                    //inputArr.push.apply(inputArr, [dataObj.SPYt1,dataObj.SPYt2,dataObj.SPYt3,dataObj.Volume, dataObj.USD_EUR, dataObj.USD_GBP] );
                    inputTempArr.push(dataObj);
                    inputArr.push(inputTempArr);
                    outputTempArr.push(dataObj.nextDayClose, combinedDataArray[i].Date);
                    outputArr.push(outputTempArr);

                    jointArr.push(inputArr);
                    jointArr.push(outputArr);

                    trainArr.push(jointArr);
                    //console.log(combinedDataArray[i].Date);
                }


            }



            //Stat set
            StatSPYt1 = new Stats();
            StatSPYt2 = new Stats();
            StatSPYt3 = new Stats();
            StatSPYt5 = new Stats();
            StatSPYt10 = new Stats();
            StatMACD5 = new Stats();
            StatMACD10 = new Stats();
            StatMACD15 = new Stats();
            StatVolume = new Stats();




            //Prepare Stat Set
            for(var i=0;i<inputArr.length;i++){
                dataObj = new Object();
                dataObj = inputArr[i][0];

                    StatSPYt1.push(dataObj.SPYt1);
                    StatSPYt2.push(dataObj.SPYt2);
                    StatSPYt3.push(dataObj.SPYt3);
                    StatSPYt5.push(dataObj.SPYt5);
                    StatSPYt10.push(dataObj.SPYt10);
                    StatMACD5.push(dataObj.MACD5);
                    StatMACD10.push(dataObj.MACD10);
                    StatMACD15.push(dataObj.MACD15);
                    StatVolume.push(dataObj.Volume);




            }



            StatSPYt1Min = StatSPYt1.range()[0];
            StatSPYt1Max = StatSPYt1.range()[1];
            StatSPYt2Min = StatSPYt2.range()[0];
            StatSPYt2Max = StatSPYt2.range()[1];
            StatSPYt3Min = StatSPYt3.range()[0];
            StatSPYt3Max = StatSPYt3.range()[1];
            StatSPYt5Min = StatSPYt5.range()[0];
            StatSPYt5Max = StatSPYt5.range()[1];
            StatSPYt10Min = StatSPYt10.range()[0];
            StatSPYt10Max = StatSPYt10.range()[1];
            StatMACD5Min = StatMACD5.range()[0];
            StatMACD5Max = StatMACD5.range()[1];
            StatMACD10Min = StatMACD10.range()[0];
            StatMACD10Max = StatMACD10.range()[1];
            StatMACD15Min = StatMACD15.range()[0];
            StatMACD15Max = StatMACD15.range()[1];
            StatVolumeMin = StatVolume.range()[0];
            StatVolumeMax = StatVolume.range()[1];


            //normalize input array
            
            for(var i=0;i<inputArr.length;i++){

                    dataObj = new Object();
                    inputTempArr = new Array();

                    jointArr = new Array();



                    dataObj.SPYt1 = ((inputArr[i][0].SPYt1 - StatSPYt1Min)/(StatSPYt1Max - StatSPYt1Min)).toFixed(4); //Total Return Close T1 - CloseT0/CloseT0
                    dataObj.SPYt2 = (inputArr[i][0].SPYt2 - StatSPYt2Min)/(StatSPYt2Max - StatSPYt2Min).toFixed(4);
                    dataObj.SPYt3 = (inputArr[i][0].SPYt3 - StatSPYt3Min)/(StatSPYt3Max - StatSPYt3Min).toFixed(4);
                    dataObj.SPYt5 = (inputArr[i][0].SPYt5 - StatSPYt5Min)/(StatSPYt5Max - StatSPYt5Min).toFixed(4);
                    dataObj.SPYt10 = (inputArr[i][0].SPYt10 - StatSPYt10Min)/(StatSPYt10Max - StatSPYt10Min).toFixed(4);
                    dataObj.MACD5 = (inputArr[i][0].MACD5 - StatMACD5Min)/(StatMACD5Max - StatMACD5Min).toFixed(4);
                    dataObj.MACD10 = (inputArr[i][0].MACD10 - StatMACD10Min)/(StatMACD10Max - StatMACD10Min).toFixed(4);
                    dataObj.MACD15 = (inputArr[i][0].MACD15 - StatMACD15Min)/(StatMACD15Max - StatMACD15Min).toFixed(4);
                    dataObj.Volume = (inputArr[i][0].Volume - StatVolumeMin)/(StatVolumeMax - StatVolumeMin).toFixed(4);




                    //dataObj.nextDayClose = rows[i-1].Close;
                    //inputArr.push.apply(inputArr, [dataObj.SPYt1,dataObj.SPYt2,dataObj.SPYt3,dataObj.Volume, dataObj.USD_EUR, dataObj.USD_GBP] );
                    inputTempArr.push(dataObj.SPYt1,dataObj.SPYt2,dataObj.SPYt3,dataObj.SPYt5,dataObj.SPYt10,dataObj.MACD5, dataObj.MACD10, dataObj.MACD15);
                    normalizedInputArr.push(inputTempArr);

                } 


          

            callback(normalizedInputArr, outputArr);
        });



}