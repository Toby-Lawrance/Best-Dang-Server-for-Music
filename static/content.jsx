class Video extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {value: props.value};
  }

  render() {
    return (
      <div className="Song">
        <div className="SongTitle">
          {this.state.value.title}
        </div>
        <div className="SongLength">
          {this.state.value.length}
        </div>
      </div>
    );
  }
}

class Bucket extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {bucketNum: props.value, contents:props.contents};
  }

  render() {
    var songs = [];
    for(var i = 0; i < this.state.contents.length; i++)
    {
      songs.push(<li><Video key={this.state.contents[i]} value={this.state.contents[i]} /></li>);
    }

    return (
      <div className="Bucket">
        Bucket {this.state.bucketNum}
        <ol className="BucketList">
          {songs}
        </ol>
      </div>
    );
  }
}

class YTUpload extends React.Component
{
  constructor(props)
  {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event)
  {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(event.target));
    console.log("Sending: " + JSON.stringify(data));
    console.log(data);

    fetch('/ytd', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
           'Content-Type': 'application/json',
       },
    }).then(response => response.json())
    .then(json => {
      console.log("Got: " + JSON.stringify(json));
  });

  }

  render()
  {
    return (
    <form id="uploadYTform" onSubmit={this.handleSubmit}>
      <div className="ytUrl">
        <label className="title">URL:</label>
        <input type="text" name="url" id="urlInp" />
      </div>
      <div className="btn">
        <input type="submit" id="submitBtn" value="Submit" />
      </div>
    </form>
  );
  }
}

class FileUpload extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {
      selectedFile: null
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
  }

  handleSubmit(event)
  {
    event.preventDefault();

    const data = new FormData();

    data.append('file',this.state.selectedFile);

    console.log("Sending: " + JSON.stringify(data));
    fetch('/file', {
      method: 'POST',
      body: data,
    })
    .then(response => response.json())
    .then(json => {
      console.log("Got: " + JSON.stringify(json));
  });
  }

  onChangeHandler(event)
  {
    event.preventDefault();
    console.log(event.target.files[0]);
    this.setState({selectedFile:event.target.files[0]});
  }

  render()
  {
    return (
    <form id="uploadFileform" onSubmit={this.handleSubmit}>
      <div className="fUpload">
        <label className="filelbl">File:</label>
        <input type="file" name="file" id="fileInp" onChange={this.onChangeHandler}/>
      </div>
      <div className="btn">
        <input type="submit" id="submitBtn" value="Submit" />
      </div>
    </form>
  );
  }
}

class AliasBox extends React.Component
{
  render() {
    return (
      <form id="aliasBox" onSubmit={this.handleSubmit}>
          <div className ="alias">
            <label className="aliaslbl">Alias: </label>
            <input type="text" name="alias" id="aliasInp"/>
          </div>
          <div className="btn">
            <input type="submit" id="submitBtn" value="Submit" />
          </div>
      </form>
    );
  }
}

class Upload extends React.Component
{

  constructor(props)
  {
    super(props);
    this.state = {ytShow:true,fShow:false}
    this.swapTab = this.swapTab.bind(this);
  }

  swapTab() {
    this.setState({ytShow:!this.state.ytShow,fShow:!this.state.fShow});
  }

  render() {
    return (
      <div className="UploadBox">
        <div className="tabs">
          <a className="tab" onClick={this.swapTab} >YT</a>
          <a className="tab" onClick={this.swapTab} >File</a>
        </div>
        <div className="ytdBox" style={{display:this.state.ytShow}}>
          { this.state.ytShow ? <YTUpload /> : null }
        </div>
        <div className="fileBox" style={{display:this.state.fShow}}>
          { this.state.fShow ? <FileUpload /> : null}
        </div>
        <div className="AliasBox">
          <AliasBox />
        </div>
      </div>
    );
  }
}

class Buckets extends React.Component
{
  constructor(props) {
    super(props);

    this.state={buckets:[]};
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);

  }

  componentDidMount() {
    this.timerID = setInterval(
      () => {
        fetch('/queue',{
        method:'POST'
      }).then(response => response.json())
      .then(json => {
        this.setState({buckets:json.buckets});
        console.log("State of buckets: " + JSON.stringify(this.state.buckets));
      }).catch(err => console.log("Server appears to be down or have an error: " + err));
    }
      , 2500
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }


  render() {
    var buckets = [];

    for(var i = 0; i < this.state.buckets.length; i++)
    {
      buckets.push(<Bucket key={this.state.buckets[i]} value={i} contents={this.state.buckets[i]} />);
    }

    return (
      <div className="Buckets">
      {buckets}
      </div>
    );
  }
}

class Display extends React.Component
{
  constructor(props)
  {
    super(props);
    this.state = {numBuckets:10};
  }

  render ()
  {
    return (
        <div className="MainSection">
          <Upload />
          <Buckets />
        </div>
      );
  }
}

ReactDOM.render(
  <Display />,
  document.getElementById('root')
);
