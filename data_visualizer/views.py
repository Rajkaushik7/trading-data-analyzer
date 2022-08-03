import pandas as pd
from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader
from django.views.decorators.csrf import csrf_exempt


def index(request):
    template = loader.get_template('data_visualizer/index.html')
    return HttpResponse(template.render())

@csrf_exempt
def fetch_data(request):
    post_data = request.POST
    a = post_data['start_date'].replace('-', '/')
    b = post_data['end_date'].replace('-', '/')
    t = post_data['legs'].split(',') 
    u = [post_data['start_time'], post_data['end_time']]
    f = post_data['ohlc']
    path = post_data['path']
    d_file = 'NSEI' if (path == 'nifty') else "NSEBANK"

    # Test Data
    # a='2017/01/01'
    # b='2017/12/31'
    # t='PE,+100,CE,-100,PE,+200,CE,+150,PE,-150,CE,-50,PE,+150'
    # t = t.split(',') 
    # u=['09:15','11:17']
    # f='high'
    # try:
    df=pd.read_csv('/home/raj/' + path + '/' +b[:4]+'/new.csv')
    df2=pd.read_csv('/home/raj/' + path + '/' +b[:4]+ '/' + d_file + '.csv')
    df3=pd.read_csv('/home/raj/' + path + '/' +b[:4]+'/OHLC.csv',usecols = [f,'date','time'])
    # except:
    #     return HttpResponse('{"error":"File not found"}')
    df9=pd.DataFrame()
    df10=pd.DataFrame()
    for j in range(0, len(t), 2):
        for i in u:
            c=i
            d=t[j]
            e=int(t[j+1])
            df2['close']=df2.close+e
            df4=df2.loc[(df2['date'] >= a) & (df2['date'] <= b)&(df2.time==c)]
            df5=df.loc[(df['date'] >= a) & (df['date'] <= b)&(df.new==d)&(df.time==c)]
            df6=df3.loc[(df3['date'] >= a) & (df3['date'] <= b)&(df3.time==c)]
            date=df5.date.tolist()
            df4=df4.set_index('date').reindex(date)
            df5=df5.set_index('date')
            df7=pd.concat([df5,df4],axis=1)
            df7.columns=['ticker', 'time', 'open', 'high', 'low', 'close', 'new', 'strike',
                'ticker', 'time', 'open1', 'high1', 'low1', 'close1']
            df7=df7.loc[df7[f+'1']==df7.strike]
            df7=pd.DataFrame(df7.groupby('date')[f].min())
            date=df6.reset_index().date.tolist()
            df6=df6.set_index('date')
            df7=df7.reindex(date)
            df8=pd.concat([df6,df7],axis=1)
            df8.columns=['time','strike'+str(e)+str(d)+'('+str(u.index(i))+')','option'+str(e)+str(d)+'('+str(u.index(i))+')']
            df9=pd.concat([df9,df8],axis=1)
    df9
    new=[6]
    while new[-1]<len(df9.columns):
        for i in [1,2]:
            new.append(new[-1]+i)
    df9=df9.drop(df9.iloc[:,new[:-1]], axis=1)
    df9.insert(0, 'time1',u[0])
    df9.insert(3, 'time2',u[1])
    new=df9.columns
    df9.rename(columns = {new[1]:'spot(1)',new[4]:'spot(2)'}, inplace = True)
    df9.dropna()
    return HttpResponse(df9.to_json(orient='split'))
