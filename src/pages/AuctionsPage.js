import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import Auction from "../components/Auction";
import BidModal from "../components/BidModal";
import { Fab, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import moment from "moment";

const containerWidth = 1000;
const cardPadding = 14;
const cardWidth = (containerWidth / 2) - (cardPadding * 2); 

const useStyles = makeStyles({
  auctionsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: containerWidth,
    margin: 'auto',
    '@media (max-width: 900px)' : {
      alignItems: 'center',
      justifyContent: 'center'
    },
  },
  auctionCard: {
    flexBasis: cardWidth,
    flexShrink: 0,
    padding: cardPadding,
  },
  fabContainer: {
    position: 'fixed',
    bottom: 20,
    right: 20,
  },
  createAuctionButton: {
    background: 'linear-gradient(90deg, rgba(190,52,32,1) 0%, rgba(231,75,77,1) 48%, rgba(231,148,74,1) 100%)',
  },
});

const AuctionsPage = (props) => {
  const { auctionStore, authStore, routerHistory } = props;
  const [auctionsData, setAuctionsData] = useState([]);
  const {auctions} = auctionStore;
  const classes = useStyles();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await auctionStore.fetchAuctions();
      setLoading(false);
      setInterval(() => {
        if (routerHistory.location.pathname === '/auctions' || routerHistory.location.pathname === '/') {
          auctionStore.fetchAuctions();
        }
      }, process.env.REACT_APP_REFRESH_RATE * 1000);
    })();
  }, [auctionStore, routerHistory]);

  useEffect(() => {
    if(auctions.length > 0) {
      let filteredAuctions = auctions.filter((auction) => {
        const currentDateTime = moment();
        const auctionTime = moment(auction.endingAt);

        const hasPassed = currentDateTime.isAfter(auctionTime);
        if(!hasPassed) return true;
      });

      setAuctionsData(filteredAuctions);
    }
    // setLoading(false);
  }, [JSON.stringify(auctions)])
  

  const renderAuctions = () => {
    const { auctions } = auctionStore;

    if(loading) {
      return (
        <>
          <span class="loader"></span>
        </>
      )
    }

    if (!auctionsData.length && !loading) {
      return (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h4>No auctions available. Create one?</h4>
        </div>
      );
    }

    return auctionsData.map((auction) => {
      let bidState = 'CAN_BID';

      if (auction.seller === authStore.email) {
        bidState = 'OWN_AUCTION';
      }

      if (auction.highestBid.bidder === authStore.email) {
        bidState = 'HIGHEST_BIDDER';
      }

      return (
        <div key={auction.id} className={classes.auctionCard}>
          <Auction
            auction={auction}
            bidState={bidState}
            onBid={() => auctionStore.setBiddingOn(auction)}
          />
        </div>
      );
    });
  };

  return (
    <div className={classes.auctionsContainer}>
      <BidModal />

      {renderAuctions()}
      
      <div className={classes.fabContainer}>
        <Fab
          color="primary"
          aria-label="add"
          className={classes.createAuctionButton}
          onClick={() => routerHistory.push('/create')}
        >
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
};

export default inject("auctionStore", "authStore", "routerHistory")(observer(AuctionsPage));