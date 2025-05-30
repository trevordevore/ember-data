import type { Store } from '@warp-drive/core';
import type { ModelSchema } from '@warp-drive/core/types';
import type { ObjectValue } from '@warp-drive/core/types/json/raw';
import type { JsonApiDocument, SingleResourceDocument } from '@warp-drive/core/types/spec/json-api-raw';

import type { AdapterPayload } from './minimum-adapter-interface.ts';
import type { Snapshot } from './snapshot.ts';

export type SerializerOptions = { includeId?: boolean };
export type RequestType =
  | 'findRecord'
  | 'queryRecord'
  | 'findAll'
  | 'findBelongsTo'
  | 'findHasMany'
  | 'findMany'
  | 'query'
  | 'createRecord'
  | 'deleteRecord'
  | 'updateRecord';

/**
 * <blockquote style="margin: 1em; padding: .1em 1em .1em 1em; border-left: solid 1em #E34C32; background: #e0e0e0;">
  <p>
    ⚠️ <strong>This is LEGACY documentation</strong> for a feature that is no longer encouraged to be used.
    If starting a new app or thinking of implementing a new adapter, consider writing a
    <a href="/ember-data/release/classes/%3CInterface%3E%20Handler">Handler</a> instead to be used with the <a href="https://github.com/emberjs/data/tree/main/packages/request#readme">RequestManager</a>
  </p>
  </blockquote>

  The following documentation describes the methods an application
  serializer should implement with descriptions around when an
  application might expect these methods to be called.

  Methods that are not required are marked as **optional**.

  @class (Interface) Serializer
  @public
*/
export interface MinimumSerializerInterface {
  /**
   * This method is responsible for normalizing the value resolved from the promise returned
   * by an Adapter request into the format expected by the `Store`.
   *
   * The output should be a [JSON:API Document](https://jsonapi.org/format/#document-structure)
   * with the following additional restrictions:
   *
   * - `type` should be formatted in the `singular` `dasherized` `lowercase` form
   * - `members` (the property names of attributes and relationships) should be formatted
   *    to match their definition in the corresponding `Model` definition. Typically this
   *    will be `camelCase`.
   * - [`lid`](https://github.com/emberjs/rfcs/blob/main/text/0403-ember-data-identifiers.md) is
   *    a valid optional sibling to `id` and `type` in both [Resources](https://jsonapi.org/format/#document-resource-objects)
   *    and [Resource Identifier Objects](https://jsonapi.org/format/#document-resource-identifier-objects)
   *
   * @public
   * @param {Store} store The store service that initiated the request being normalized
   * @param {ModelSchema} schema An object with methods for accessing information about
   *  the type, attributes and relationships of the primary type associated with the request.
   * @param {JSONObject} rawPayload The raw JSON response data returned from an API request.
   *  This correlates to the value the promise returned by the adapter method that performed
   *  the request resolved to.
   * @param {string|null} id For a findRecord request, this is the id initially provided
   *  in the call to store.findRecord. Else this value is null.
   * @param {'findRecord' | 'queryRecord' | 'findAll' | 'findBelongsTo' | 'findHasMany' | 'findMany' | 'query' | 'createRecord' | 'deleteRecord' | 'updateRecord'} requestType The
   *  type of request the Adapter had been asked to perform.
   *
   * @return {JsonApiDocument} a document following the structure of a JSON:API Document.
   */
  normalizeResponse(
    store: Store,
    schema: ModelSchema,
    rawPayload: AdapterPayload,
    id: string | null,
    requestType:
      | 'findRecord'
      | 'queryRecord'
      | 'findAll'
      | 'findBelongsTo'
      | 'findHasMany'
      | 'findMany'
      | 'query'
      | 'createRecord'
      | 'deleteRecord'
      | 'updateRecord'
  ): JsonApiDocument;

  /**
   * This method is responsible for serializing an individual record
   * via a [Snapshot](Snapshot) into the format expected by the API.
   *
   * This method is called by `snapshot.serialize()`.
   *
   * When using `Model`, this method is called by `record.serialize()`.
   *
   * When using `JSONAPIAdapter` or `RESTAdapter` this method is called
   * by `updateRecord` and `createRecord` if `Serializer.serializeIntoHash`
   * is not implemented.
   *
   * @public
   * @param {Snapshot} snapshot A Snapshot for the record to serialize
   * @param {Object} [options]
   */
  serialize(snapshot: Snapshot, options?: SerializerOptions): ObjectValue;

  /**
   * This method is intended to normalize data into a [JSON:API Document](https://jsonapi.org/format/#document-structure)
   * with a data member containing a single [Resource](https://jsonapi.org/format/#document-resource-objects).
   *
   * - `type` should be formatted in the singular, dasherized and lowercase form
   * - `members` (the property names of attributes and relationships) should be formatted
   *    to match their definition in the corresponding `Model` definition. Typically this
   *    will be `camelCase`.
   * - [`lid`](https://github.com/emberjs/rfcs/blob/main/text/0403-ember-data-identifiers.md) is
   *    a valid optional sibling to `id` and `type` in both [Resources](https://jsonapi.org/format/#document-resource-objects)
   *    and [Resource Identifier Objects](https://jsonapi.org/format/#document-resource-identifier-objects)
   *
   * This method is called by the `Store` when `store.normalize(modelName, payload)` is
   * called. It is recommended to use `store.serializerFor(modelName).normalizeResponse`
   * over `store.normalize`.
   *
   * This method may be called when also using the `RESTSerializer`
   * when `serializer.pushPayload` is called by `store.pushPayload`.
   * However, it is recommended to use `store.push` over `store.pushPayload` after normalizing
   * the payload directly.
   *
   * Example:
   * ```js
   * function pushPayload(store, modelName, rawPayload) {
   *   const ModelClass = store.modelFor(modelName);
   *   const serializer = store.serializerFor(modelName);
   *   const jsonApiPayload = serializer.normalizeResponse(store, ModelClass, rawPayload, null, 'query');
   *
   *   return store.push(jsonApiPayload);
   * }
   * ```
   *
   * This method may be called when also using the `JSONAPISerializer`
   * when normalizing included records. If mixing serializer usage in this way
   * we recommend implementing this method, but caution that it may lead
   * to unexpected mixing of formats.
   *
   * This method may also be called when normalizing embedded relationships when
   * using the `EmbeddedRecordsMixin`. If using this mixin in a serializer in
   * your application we recommend implementing this method, but caution that
   * it may lead to unexpected mixing of formats.
   *
   * @public
   * @optional
   * @param {ModelSchema} schema An object with methods for accessing information about
   *  the type, attributes and relationships of the primary type associated with the request.
   * @param {JSONObject} rawPayload Some raw JSON data to be normalized into a JSON:API Resource.
   * @param {String} [prop] When called by the EmbeddedRecordsMixin this param will be the
   *  property at which the object provided as rawPayload was found.
   * @return {SingleResourceDocument} A JSON:API Document
   *  containing a single JSON:API Resource
   *  as its primary data.
   */
  normalize?(schema: ModelSchema, rawPayload: ObjectValue, prop?: string): SingleResourceDocument;

  /**
   * When using `JSONAPIAdapter` or `RESTAdapter` this method is called
   * by `adapter.updateRecord` and `adapter.createRecord` if `serializer.serializeIntoHash`
   * is implemented. If this method is not implemented, `serializer.serialize`
   * will be called in this case.
   *
   * You can use this method to customize the root keys serialized into the payload.
   * The hash property should be modified by reference.
   *
   * For instance, your API may expect resources to be keyed by underscored type in the payload:
   *
   * ```js
   * {
   *   _user: {
   *     type: 'user',
   *     id: '1'
   *   }
   * }
   * ```
   *
   * Which when using these adapters can be achieved by implementing this method similar
   * to the following:
   *
   * ```js
   * serializeIntoHash(hash, ModelClass, snapshot, options) {
   *   hash[`_${snapshot.modelName}`] = this.serialize(snapshot, options).data;
   * }
   * ```
   *
   * @public
   * @optional
   * @param hash A top most object of the request payload onto
   *  which to append the serialized record
   * @param {ModelSchema} schema An object with methods for accessing information about
   *  the type, attributes and relationships of the primary type associated with the request.
   * @param {Snapshot} snapshot A Snapshot for the record to serialize
   * @param [options]
   * @return {void}
   */
  serializeIntoHash?(hash: object, schema: ModelSchema, snapshot: Snapshot, options?: SerializerOptions): void;

  /**
   * This method allows for normalization of data when `store.pushPayload` is called
   * and should be implemented if you want to use that method.
   *
   * The method is responsible for pushing new data to the store using `store.push`
   * once any necessary normalization has occurred, and no data in the store will be
   * updated unless it does so.
   *
   * The normalized form pushed to the store should be a [JSON:API Document](https://jsonapi.org/format/#document-structure)
   * with the following additional restrictions:
   *
   * - `type` should be formatted in the singular, dasherized and lowercase form
   * - `members` (the property names of attributes and relationships) should be formatted
   *    to match their definition in the corresponding `Model` definition. Typically this
   *    will be `camelCase`.
   * - [`lid`](https://github.com/emberjs/rfcs/blob/main/text/0403-ember-data-identifiers.md) is
   *    a valid optional sibling to `id` and `type` in both [Resources](https://jsonapi.org/format/#document-resource-objects)
   *    and [Resource Identifier Objects](https://jsonapi.org/format/#document-resource-identifier-objects)
   *
   * If you need better control over normalization or want access to the records being added or updated
   * in the store, we recommended using `store.push` over `store.pushPayload` after normalizing
   * the payload directly. This can even take advantage of an existing serializer for the format
   * the data is in, for example:
   *
   * ```js
   * function pushPayload(store, modelName, rawPayload) {
   *   const ModelClass = store.modelFor(modelName);
   *   const serializer = store.serializerFor(modelName);
   *   const jsonApiPayload = serializer.normalizeResponse(store, ModelClass, rawPayload, null, 'query');
   *
   *   return store.push(jsonApiPayload);
   * }
   * ```
   *
   * @public
   * @optional
   * @param {Store} store The store service that initiated the request being normalized
   * @param {Object} rawPayload The raw JSON response data returned from an API request.
   *  This JSON should be in the API format expected by the serializer.
   * @return {void}
   */
  pushPayload?(store: Store, rawPayload: ObjectValue): void;

  /**
   * In some situations the serializer may need to perform cleanup when destroyed,
   * that cleanup can be done in `destroy`.
   *
   * If not implemented, the store does not inform the serializer of destruction.
   *
   * @public
   * @optional
   */
  destroy?(): void;
}
