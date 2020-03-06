import React, {Component} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import Axios from 'axios';
import SoundPlayer from 'react-native-sound-player';
import Icon from 'react-native-vector-icons/FontAwesome';
import base64 from 'react-native-base64';
import ContentLoader from 'react-native-easy-content-loader';
import OrientationLoadingOverlay from 'react-native-orientation-loading-overlay';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataLagu: [],
      isPlaying: false,
      keyword: '',
      DataCari: [],
      LoadingSearch: false,
      LoadingPlay: false,
    };
  }

  LoadMusic = url => {
    this.setState({
      isPlaying: false,
      LoadingPlay: true,
    });
    SoundPlayer.stop();
    Axios.post(`http://api.kitabuat.com/jooy/song/`, {
      id: url,
    }).then(result => {
      this.setState({
        dataLagu: result.data,
      });
      SoundPlayer.loadUrl(result.data.mp3Url);
      SoundPlayer.addEventListener('FinishedLoadingURL', ({success, url}) => {
        SoundPlayer.play();
        this.setState({isPlaying: true, LoadingPlay: false});
        SoundPlayer.addEventListener('FinishedPlaying', ({success}) => {
          this.setState({isPlaying: false});
        });
      });
    });
  };

  PlayMusic = () => {
    if (this.state.isPlaying === true) {
      this.setState({isPlaying: false});
      SoundPlayer.pause();
    } else {
      this.setState({isPlaying: true});
      SoundPlayer.play();
    }
  };

  handleChange = key => val => {
    this.setState({[key]: val});
  };

  _search = async () => {
    this.setState({LoadingSearch: true});
    Axios.post(`http://api.kitabuat.com/jooy/search_song/`, {
      id: this.state.keyword,
    }).then(result => {
      this.setState({
        DataCari: result.data.itemlist,
        LoadingSearch: false,
      });
    });
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#373C3F'}}>
        <OrientationLoadingOverlay
          visible={this.state.LoadingPlay}
          color="white"
          indicatorSize="large"
          messageFontSize={14}
          message="Loading Song..."
        />
        <View
          style={{
            backgroundColor: '#95898E',
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderRadius: 20,
            height: 50,
            marginHorizontal: 10,
            marginTop: 5,
          }}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#F6F5F6"
            style={{
              paddingLeft: 50,
              paddingRight: 10,
              color: 'white',
              padding: 10,
              position: 'relative',
            }}
            onChangeText={this.handleChange('keyword')}
            value={this.state.keyword}
            onSubmitEditing={this._search}
          />
          <Icon
            name="search"
            style={{
              position: 'absolute',
              top: 10,
              left: 15,
            }}
            size={25}
            color="white"
          />
        </View>
        <ScrollView style={{flex: 1, marginTop: 20, marginHorizontal: 30}}>
          <ContentLoader
            loading={this.state.LoadingSearch}
            animationDuration={500}
            active
            pRows={1}
            listSize={2}
            pHeight={[20, 30, 100]}>
            <FlatList
              data={this.state.DataCari}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={{marginBottom: 25}}
                  onPress={() => this.LoadMusic(base64.encode(item.songid))}>
                  <Text style={{color: '#F6F5F6', fontSize: 18}}>
                    {base64.decode(item.info1)}
                  </Text>
                  <Text style={{color: '#F6F5F6', fontSize: 16}}>
                    {base64.decode(item.info2)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </ContentLoader>
        </ScrollView>
        <View
          style={{
            height: 70,
            backgroundColor: '#18D1A8',
            flexDirection: 'row',
          }}>
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity onPress={this.PlayMusic}>
              {this.state.isPlaying ? (
                <Icon name="pause" size={30} color="white" />
              ) : (
                <Icon name="play" size={30} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
