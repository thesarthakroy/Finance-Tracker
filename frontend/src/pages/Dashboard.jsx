import {useEffect,useState} from 'react';
import {Grid,Paper,Typography,List,ListItem,ListItemText} from '@mui/material';
import {Doughnut,Bar} from 'react-chartjs-2';
import {Chart as ChartJS,ArcElement,BarElement,CategoryScale,LinearScale,Tooltip,Legend} from 'chart.js';
import api from '../services/api';
ChartJS.register(ArcElement,BarElement,CategoryScale,LinearScale,Tooltip,Legend);

const Card=({title,value})=><Paper sx={{p:3}}><Typography color="text.secondary">{title}</Typography><Typography variant="h4">Rs. {Number(value||0).toLocaleString('en-IN',{maximumFractionDigits:2})}</Typography></Paper>;

export default function Dashboard({onError}){
 const [data,setData]=useState(null);
 useEffect(()=>{api.get('/reports/monthly/').then(r=>setData(r.data)).catch(()=>onError('Could not load dashboard data.'))},[]);
 if(!data)return <Typography>Loading dashboard...</Typography>;
 const labels=data.by_category.map(x=>x.category), values=data.by_category.map(x=>x.total);
 return <><Typography variant="h4" gutterBottom>Financial dashboard</Typography><Typography color="text.secondary" sx={{mb:3}}>Your {data.month}/{data.year} overview</Typography><Grid container spacing={2}>
 <Grid item xs={12} md={4}><Card title="Income" value={data.income}/></Grid><Grid item xs={12} md={4}><Card title="Expenses" value={data.expenses}/></Grid><Grid item xs={12} md={4}><Card title="Net savings" value={data.savings}/></Grid>
 <Grid item xs={12}><Paper sx={{p:3}}><Typography variant="h6">Financial insights</Typography><List dense>{(data.insights||[]).map((insight,index)=><ListItem key={index} disableGutters><ListItemText primary={insight}/></ListItem>)}</List></Paper></Grid>
 <Grid item xs={12} md={6}><Paper sx={{p:3,height:340}}><Typography variant="h6">Expense categories</Typography>{labels.length?<Doughnut data={{labels,datasets:[{data:values,backgroundColor:['#155e75','#0f766e','#f59e0b','#ef4444','#8b5cf6']}]}}/>:<Typography sx={{mt:4}}>Add expense transactions to see a breakdown.</Typography>}</Paper></Grid>
 <Grid item xs={12} md={6}><Paper sx={{p:3,height:340}}><Typography variant="h6">Income vs expenses</Typography><Bar data={{labels:['This month'],datasets:[{label:'Income',data:[data.income],backgroundColor:'#0f766e'},{label:'Expenses',data:[data.expenses],backgroundColor:'#ef4444'}]}}/></Paper></Grid>
 </Grid></>;
}
