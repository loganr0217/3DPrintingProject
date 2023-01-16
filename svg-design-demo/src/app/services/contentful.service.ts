import { Injectable } from '@angular/core';
import { createClient, Entry } from 'contentful';
import { marked } from 'marked';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { DomSanitizer } from '@angular/platform-browser';

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

  constructor(private sanitizer:DomSanitizer) { }

  getPosts(contentTypeId:string, query?: object): Promise<Entry<any>[]> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: contentTypeId
    }, query))
    .then(res => res.items);
  }

  getPostsOrdered(contentTypeId:string, query?: object): Promise<Entry<any>[]> {
    return this.cdaClient.getEntries(Object.assign({
      content_type: contentTypeId,
      order: "fields.placementId"
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

  addModalLink(s:string, stageIndex:number) {
    return this.sanitizer.bypassSecurityTrustHtml(s.replace("https://javascript:void(0)", "javascript:void(0)").replace('<a href="javascript:void(0)"', "<a href='javascript:void(0)' data-toggle='modal' data-target='#stage3MeasurementTutorialModal' ").replace('<a href="https://howTo"', '<a href="javscript:void(0)" data-toggle="modal" data-target="#howToModal'+stageIndex+'"'));
  }

  // Converts rich text to html
  richtextToHtml(richText:any) {
    if (richText === undefined || richText === null || richText.nodeType !== 'document') {
      return '<p>Error</p>';
    }
    let options = {
      renderNode: {
        'embedded-asset-block': (node:any) =>
          `<img class="img-fluid" src="${node.data.target.fields.file.url}"/>`
      }
    }
    return documentToHtmlString(richText, options);
  }

}
