import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SiteClient } from 'datocms-client';
import randomstring from 'randomstring';

import './style.sass';

const Main = ({ plugin }) => {
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);

    const client = new SiteClient(plugin.parameters.global.datoCmsApiToken);
    const uuids = [];

    // Get model ID
    client.itemTypes
      .find(plugin.itemType.attributes.api_key)
      .then((itemType) => {
        // Get list of IDs
        client.items
          .all(
            {
              'filter[type]': itemType.id,
            },
            {
              allPages: true,
            },
          )
          .then((items) => {
            items.forEach((item) => {
              uuids.push(item[plugin.field.attributes.api_key]);
            });

            let id = '';

            for (;;) {
              id = `${randomstring.generate({
                length: 8,
                charset: 'hex',
              })}-${randomstring.generate({
                length: 4,
                charset: 'hex',
              })}-${randomstring.generate({
                length: 4,
                charset: 'hex',
              })}-${randomstring.generate({
                length: 4,
                charset: 'hex',
              })}-${randomstring.generate({
                length: 12,
                charset: 'hex',
              })}`.toLowerCase();

              if (!uuids.includes(id)) {
                break;
              }
            }

            // Set field value
            plugin.setFieldValue(plugin.fieldPath, id);
            plugin.notice(`${plugin.field.attributes.label} generated successfully.`);
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
            plugin.notice('An error has occured, please try again.');
            setLoading(false);
          });
      })
      .catch((error) => {
        console.error(error);
        plugin.notice('An error has occured, please try again.');
        setLoading(false);
      });
  };

  return loading ? (
    <p className="loading">Loading...</p>
  ) : (
    <a href="#generate" className="button" onClick={() => generate()}>
      Generate
      {` ${plugin.field.attributes.label.toLowerCase()}`}
    </a>
  );
};

Main.propTypes = {
  plugin: PropTypes.object.isRequired,
};

export default Main;
