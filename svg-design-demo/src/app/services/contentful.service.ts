import { Injectable } from '@angular/core';
import { createClient, Entry } from 'contentful';
import { marked } from 'marked';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

const CONFIG = {
  space: 'ptwvalfxn2gq',
  accessToken:
    'vbNYRnN0j8u2DyQQmzqavySVksn3pmPCCAfuGS4WRxU',
};

@Injectable({
  providedIn: 'root'
})

export class ContentfulService {
  private cdaClient = createClient({
    space: CONFIG.space,
    accessToken: CONFIG.accessToken
  });

  constructor() { }

  getPosts(contentTypeId:string, query?: object): Promise<Entry<any>[]> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: contentTypeId
    }, query))
    .then(res => res.items);
  }

  getPostById(postId:string, contentTypeId:string, query?: object): Promise<Entry<any>> {
    return this.cdaClient.getEntry(postId, Object.assign({
      content_type: contentTypeId
    }, query)).then()
  }

  // Converts markdown to html
  markdownToHtml(md:string):any {
    return marked(md);
  }

  // Converts rich text to html
  richtextToHtml(richText:any) {
    if (richText === undefined || richText === null || richText.nodeType !== 'document') {
      return '<p>Error</p>';
    }
    return documentToHtmlString(richText);
  }

}
